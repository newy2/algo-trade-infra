import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import AwsConfig from "../../../util/AwsConfig";
import { EventRule } from "@pulumi/aws/cloudwatch";
import LambdaInfo from "../../lambda/LambdaInfo";
import BackendAppInfra from "../../../backend_app_infra/BackendAppInfra";

export default class RuleInfo {
  constructor(backendAppInfraList: BackendAppInfra[], lambdaInfo: LambdaInfo) {
    new EcrPushEventRuleInfo(backendAppInfraList, lambdaInfo);
    new Ec2ScaleUpEventRuleInfo(lambdaInfo);
    new Ec2ScaleDownEventRuleInfo(lambdaInfo);
  }
}

class EcrPushEventRuleInfo extends AwsConfig {
  constructor(backendAppInfraList: BackendAppInfra[], lambdaInfo: LambdaInfo) {
    super();

    const eventRule = this.createEventRule(backendAppInfraList);
    this.createEventTargetFastCleanupEcrImage(eventRule, lambdaInfo);
    this.createEventTargetRequestBackendDeliveryScaleUp(eventRule, lambdaInfo);
  }

  private createEventRule(backendAppInfraList: BackendAppInfra[]) {
    const name = "ecr-image-pushed";

    return new aws.cloudwatch.EventRule(name, {
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
  }

  private createEventTargetFastCleanupEcrImage(
    eventRule: EventRule,
    lambdaInfo: LambdaInfo,
  ) {
    if (!this.isFastCleanupEcrImage()) {
      return;
    }

    const prefix = "ecr-cleanup";
    const functionArn =
      lambdaInfo.functionInfo.getCleanupEcrImageFunctionArn()!;

    new aws.lambda.Permission(`${prefix}-lambda-permission`, {
      action: "lambda:InvokeFunction",
      function: functionArn,
      principal: "events.amazonaws.com",
      sourceArn: eventRule.arn,
    });

    new aws.cloudwatch.EventTarget(`${prefix}-event-target`, {
      rule: eventRule.name,
      arn: functionArn,
    });
  }

  private createEventTargetRequestBackendDeliveryScaleUp(
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
}

class BaseEc2ScaleEventRuleInfo extends AwsConfig {
  protected createEventTargetBackendDeliverySqsMapping(
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

class Ec2ScaleUpEventRuleInfo extends BaseEc2ScaleEventRuleInfo {
  constructor(lambdaInfo: LambdaInfo) {
    super();

    const eventRule = this.createEventRule();
    this.createEventTargetBackendDeliveryVerifyInstance(eventRule, lambdaInfo);
    this.createEventTargetBackendDeliverySqsMapping(
      "create-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createEventRule() {
    const name = "ec2-instance-scale-up-event-rule";

    return new aws.cloudwatch.EventRule(name, {
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
  }

  private createEventTargetBackendDeliveryVerifyInstance(
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
}

class Ec2ScaleDownEventRuleInfo extends BaseEc2ScaleEventRuleInfo {
  constructor(lambdaInfo: LambdaInfo) {
    super();

    const eventRule = this.createEventRule();
    this.createEventTargetBackendDeliverySqsMapping(
      "delete-mapping",
      eventRule,
      lambdaInfo,
    );
  }

  private createEventRule() {
    const name = "ec2-instance-scale-down-event-rule";

    return new aws.cloudwatch.EventRule(name, {
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
  }
}
