import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import BaseAwsInfo from "../../BaseAwsInfo";
import { EventRule } from "@pulumi/aws/cloudwatch";
import LambdaInfo from "../../lambda/LambdaInfo";
import BackendAppInfra from "../../../backend_app_infra/BackendAppInfra";

export default class RuleInfo extends BaseAwsInfo {
  constructor(backendAppInfraList: BackendAppInfra[], lambdaInfo: LambdaInfo) {
    super();

    this.createPushEcrRepositoryEventRule(backendAppInfraList, lambdaInfo);
    this.createEc2InstanceScaleUpEventRule(lambdaInfo);
    this.createEc2InstanceScaleDownEventRule(lambdaInfo);
  }

  private createPushEcrRepositoryEventRule(
    backendAppInfraList: BackendAppInfra[],
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
          "repository-name": backendAppInfraList.map((each) =>
            each.ecrInfo.privateRepositoryInfo.getPrivateRepositoryName(),
          ),
        },
      }),
    });

    this.createFastCleanupEcrImageEventTarget(eventRule, lambdaInfo);
    this.createBackendDeliveryStartScaleUpEventTarget(eventRule, lambdaInfo);
  }

  private createFastCleanupEcrImageEventTarget(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    if (!this.isFastCleanupEcrImage()) {
      return;
    }

    const functionArn =
      lambdaInfo.functionInfo.getCleanupEcrImageFunctionArn()!;
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

  private createBackendDeliveryStartScaleUpEventTarget(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const prefix = "backend-delivery-scale-up";
    const functionArn =
      lambdaInfo.functionInfo.backendDelivery.getScaleUpFunctionArn();

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

  private createEc2InstanceScaleUpEventRule(lambdaInfo: LambdaInfo) {
    const name = "ec2-instance-scale-up-event-rule";

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

    this.createBackendDeliveryVerifyInstanceEventTarget(eventRule, lambdaInfo);
    this.createBackendDeliveryRequestScaleDownQueueMappingEventTarget(
      "create-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createBackendDeliveryVerifyInstanceEventTarget(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const prefix = "backend-delivery-verify-instance";
    const functionArn =
      lambdaInfo.functionInfo.backendDelivery.getVerifyInstanceFunctionArn();

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

  private createEc2InstanceScaleDownEventRule(lambdaInfo: LambdaInfo) {
    const name = "ec2-instance-scale-down-event-rule";

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

    this.createBackendDeliveryRequestScaleDownQueueMappingEventTarget(
      "delete-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createBackendDeliveryRequestScaleDownQueueMappingEventTarget(
    prefix: string,
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    const functionArn =
      lambdaInfo.functionInfo.backendDelivery.getRequestScaleDownQueueMappingFunctionArn();

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
