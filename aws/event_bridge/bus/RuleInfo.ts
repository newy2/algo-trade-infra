import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import EcrInfo from "../../ecr/EcrInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import { EventRule } from "@pulumi/aws/cloudwatch";
import LambdaInfo from "../../lambda/LambdaInfo";

export default class RuleInfo extends BaseAwsInfo {
  constructor(ecrInfo: EcrInfo, lambdaInfo: LambdaInfo) {
    super();

    this.createPushEcrRepositoryEventRule(ecrInfo, lambdaInfo);
    this.createAutoscalingGroupInstanceSizeUpEventRule(lambdaInfo);
    this.createAutoscalingGroupInstanceSizeDownEventRule(lambdaInfo);
  }

  private createPushEcrRepositoryEventRule(
    ecrInfo: EcrInfo,
    lambdaInfo: LambdaInfo,
  ) {
    const name = "ecr-image-pushed";

    const eventRule = new aws.cloudwatch.EventRule(name, {
      name,
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

    this.createFastCleanupEcrImageEventTarget(eventRule, lambdaInfo);
    this.createBackendDeliveryInitEventTarget(eventRule, lambdaInfo);
  }

  private createFastCleanupEcrImageEventTarget(
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

  private createBackendDeliveryInitEventTarget(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const prefix = "backend-delivery-init";
    const functionArn = lambdaInfo.getBackendDeliveryInitFunctionArn();

    new aws.lambda.Permission(`${prefix}-lambda-permission`, {
      action: "lambda:InvokeFunction",
      principal: "events.amazonaws.com",
      sourceArn: eventRule.arn,
      function: functionArn,
    });

    new aws.cloudwatch.EventTarget(`${prefix}-event-target`, {
      rule: eventRule.name,
      arn: functionArn,
    });
  }

  private createAutoscalingGroupInstanceSizeUpEventRule(
    lambdaInfo: LambdaInfo,
  ) {
    const name = "backend-autoscaling-group-instance-size-up-event-rule";

    const eventRule = new aws.cloudwatch.EventRule(name, {
      name,
      description: "ASG 새 인스턴스 추가 상태 발생",
      eventPattern: JSON.stringify({
        source: ["aws.autoscaling"],
        "detail-type": ["EC2 Instance Launch Successful"],
        detail: {
          AutoScalingGroupName: [this.getBackendServerAutoScalingGroupName()],
        },
      }),
    });

    this.createBackendDeliveryProcessingEventTarget(eventRule, lambdaInfo);
    this.createBackendDeliveryEventSourceMapperEventTarget(
      "backend-create-event-source-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createBackendDeliveryProcessingEventTarget(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const prefix = "backend-delivery-processing";
    const functionArn = lambdaInfo.getBackendDeliveryProcessingFunctionArn();

    new aws.lambda.Permission(`${prefix}-lambda-permission`, {
      action: "lambda:InvokeFunction",
      principal: "events.amazonaws.com",
      sourceArn: eventRule.arn,
      function: functionArn,
    });

    new aws.cloudwatch.EventTarget(`${prefix}-event-target`, {
      rule: eventRule.name,
      arn: functionArn,
    });
  }

  private createAutoscalingGroupInstanceSizeDownEventRule(
    lambdaInfo: LambdaInfo,
  ) {
    const name = "backend-autoscaling-group-instance-size-down-event-rule";

    const eventRule = new aws.cloudwatch.EventRule(name, {
      name,
      description: "ASG 인스턴스 제거 상태 발생",
      eventPattern: JSON.stringify({
        source: ["aws.autoscaling"],
        "detail-type": ["EC2 Instance Terminate Successful"],
        detail: {
          AutoScalingGroupName: [this.getBackendServerAutoScalingGroupName()],
        },
      }),
    });

    this.createBackendDeliveryEventSourceMapperEventTarget(
      "backend-delete-event-source-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createBackendDeliveryEventSourceMapperEventTarget(
    prefix: string,
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const functionArn =
      lambdaInfo.getBackendDeliveryEventSourceMapperFunctionArn();

    new aws.lambda.Permission(`${prefix}-lambda-permission`, {
      action: "lambda:InvokeFunction",
      principal: "events.amazonaws.com",
      sourceArn: eventRule.arn,
      function: functionArn,
    });

    new aws.cloudwatch.EventTarget(`${prefix}-event-target`, {
      rule: eventRule.name,
      arn: functionArn,
    });
  }
}
