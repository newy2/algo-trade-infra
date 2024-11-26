import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import EcrInfo from "../../ecr/EcrInfo";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import { EventRule } from "@pulumi/aws/cloudwatch";
import LambdaInfo from "../../lambda/LambdaInfo";
import ParameterStoreInfo from "../../ssm/application_management/ParameterStoreInfo";

export default class RuleInfo extends BaseAwsInfo {
  constructor(ecrInfo: EcrInfo, iamInfo: IamInfo, lambdaInfo: LambdaInfo) {
    super();

    this.createPushEcrEventRule(ecrInfo, iamInfo, lambdaInfo);
  }

  private createPushEcrEventRule(
    ecrInfo: EcrInfo,
    iamInfo: IamInfo,
    lambdaInfo: LambdaInfo,
  ) {
    const ecrPushRule = this.createEventRulePushEcrRepository(ecrInfo);
    this.createEventTargetRestartServer(ecrPushRule, iamInfo);
    this.createEventTargetFastCleanupEcrImage(ecrPushRule, lambdaInfo);
  }

  private createEventRulePushEcrRepository(ecrInfo: EcrInfo) {
    return new aws.cloudwatch.EventRule("ecr-image-pushed", {
      description: "Triggers on new image push to ECR",
      eventPattern: pulumi.jsonStringify({
        source: ["aws.ecr"],
        "detail-type": ["ECR Image Action"],
        detail: {
          "action-type": ["PUSH"],
          result: ["SUCCESS"],
          "repository-name": [ecrInfo.getPrivateRepositoryName()],
        },
      }),
    });
  }

  private createEventTargetRestartServer(
    eventRule: EventRule,
    iamInfo: IamInfo,
  ) {
    new aws.cloudwatch.EventTarget("restart-backend-server", {
      rule: eventRule.name,
      arn: `arn:aws:ssm:${this.getCurrentRegion()}::document/AWS-RunShellScript`,
      roleArn: iamInfo.getEventBridgeEcrPushRuleRoleArn(),
      runCommandTargets: [
        {
          key: "tag:Name",
          values: [this.getEc2ServerName()],
        },
      ],
      input: JSON.stringify({
        executionTimeout: ["3600"],
        commands: [
          `PORT=80`,
          `ECR_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.ECR_PRIVATE_REPOSITORY_URL_KEY}" --query "Parameter.Value" --output text)`,
          `DB_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_ENDPOINT_KEY}" --query "Parameter.Value" --output text)`,
          `DB_USERNAME=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_USERNAME_KEY}" --query "Parameter.Value" --output text)`,
          `DB_PASSWORD=$(aws ssm get-parameter --name "${ParameterStoreInfo.RDS_PASSWORD_KEY}" --with-decryption --query "Parameter.Value" --output text)`,
          `FRONTEND_URL=$(aws ssm get-parameter --name "${ParameterStoreInfo.FRONTEND_URL_KEY}" --with-decryption --query "Parameter.Value" --output text)`,
          `aws ecr get-login-password --region ${this.getCurrentRegion()} | docker login --username AWS --password-stdin "$ECR_URL"`,
          `docker pull "$ECR_URL":latest`,
          `if [ "$(docker ps -q)" ]; then docker stop $(docker ps -q) && docker rm $(docker ps -al -q); fi`,
          `docker run -d \
           -p $PORT:$PORT \
           -e X_PORT=$PORT \
           -e X_DB_URL=$DB_URL \
           -e X_DB_URL=$DB_URL \
           -e X_DB_USERNAME=$DB_USERNAME \
           -e X_DB_PASSWORD=$DB_PASSWORD \
           -e X_FRONTEND_URL=$FRONTEND_URL \
           "$ECR_URL"`,
        ],
      }),
    });
  }

  private createEventTargetFastCleanupEcrImage(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    if (!this.isFastCleanupEcrImage()) {
      return;
    }

    const functionArn = lambdaInfo.getEcrImageCleanupFunctionArn()!;
    new aws.lambda.Permission("allow-event-bridge-invoke", {
      action: "lambda:InvokeFunction",
      function: functionArn,
      principal: "events.amazonaws.com",
      sourceArn: eventRule.arn,
    });

    new aws.cloudwatch.EventTarget("ecr-event-target", {
      rule: eventRule.name,
      arn: functionArn,
    });
  }
}