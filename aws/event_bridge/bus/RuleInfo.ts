import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import EcrInfo from "../../ecr/EcrInfo";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import { EventRule } from "@pulumi/aws/cloudwatch";

export default class RuleInfo extends BaseAwsInfo {
  constructor(ecrInfo: EcrInfo, iamInfo: IamInfo) {
    super();

    this.createPushEcrEventRule(ecrInfo, iamInfo);
  }

  private createPushEcrEventRule(ecrInfo: EcrInfo, iamInfo: IamInfo) {
    const ecrPushRule = this.createEventRulePushEcrRepository(ecrInfo);
    this.createEventTargetRestartServer(ecrPushRule, iamInfo);
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
      arn: `arn:aws:ssm:${aws.config.region}::document/AWS-RunShellScript`,
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
          `ECR_URL=$(aws ssm get-parameter --name "/ecr/repository/url" --query "Parameter.Value" --output text)`,
          `aws ecr get-login-password --region ${this.getCurrentRegion()} | docker login --username AWS --password-stdin "$ECR_URL"`,
          `docker pull "$ECR_URL":latest`,
          `if [ "$(docker ps -q)" ]; then docker stop $(docker ps -q) && docker rm $(docker ps -al -q); fi`,
          `docker run -d -p 80:80 -e CUSTOM=auto44 "$ECR_URL"`,
        ],
      }),
    });
  }
}
