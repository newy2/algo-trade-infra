import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import EcrInfo from "../../ecr/EcrInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import { EventRule } from "@pulumi/aws/cloudwatch";
import LambdaInfo from "../../lambda/LambdaInfo";

export default class RuleInfo extends BaseAwsInfo {
  constructor(ecrInfo: EcrInfo, lambdaInfo: LambdaInfo) {
    super();

    this.createPushEcrEventRule(ecrInfo, lambdaInfo);
  }

  private createPushEcrEventRule(ecrInfo: EcrInfo, lambdaInfo: LambdaInfo) {
    const ecrPushRule = this.createEventRulePushEcrRepository(ecrInfo);
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
