import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";
import ParameterStoreInfo from "../../ssm/application_management/ParameterStoreInfo";

export default class PolicyInfo extends BaseAwsInfo {
  private readonly backendDeliveryCompleteQueueSendMessagePolicy: Policy;
  private readonly backendDeliveryCompleteQueuePurgeQueuePolicy: Policy;
  private readonly backedAutoScalingGroupReadPolicy: Policy;
  private readonly backedAutoScalingGroupUpdatePolicy: Policy;
  private readonly codeDeliveryParameterStoreUpdatePolicy: Policy;
  private readonly changeLambdaEventSourceMappingPolicy: Policy;

  constructor() {
    super();

    this.backendDeliveryCompleteQueueSendMessagePolicy =
      this.createBackendDeliveryCompleteQueueSendMessagePolicy();
    this.backendDeliveryCompleteQueuePurgeQueuePolicy =
      this.createBackendDeliveryCompleteQueuePurgeQueuePolicy();
    this.backedAutoScalingGroupReadPolicy =
      this.createBackedAutoScalingGroupReadPolicy();
    this.backedAutoScalingGroupUpdatePolicy =
      this.createBackedAutoScalingGroupUpdatePolicy();
    this.codeDeliveryParameterStoreUpdatePolicy =
      this.createCodeDeliveryParameterStoreUpdatePolicy();
    this.changeLambdaEventSourceMappingPolicy =
      this.createChangeLambdaEventSourceMappingPolicy();
  }

  public getBackendDeliveryCompleteQueueSendMessagePolicyArn() {
    return this.backendDeliveryCompleteQueueSendMessagePolicy.arn;
  }

  public getBackendDeliveryCompleteQueuePurgeQueuePolicyArn() {
    return this.backendDeliveryCompleteQueuePurgeQueuePolicy.arn;
  }

  public getBackedAutoScalingGroupReadPolicyArn() {
    return this.backedAutoScalingGroupReadPolicy.arn;
  }

  public getBackedAutoScalingGroupUpdatePolicyArn() {
    return this.backedAutoScalingGroupUpdatePolicy.arn;
  }

  public getCodeDeliveryParameterStoreUpdatePolicyArn() {
    return this.codeDeliveryParameterStoreUpdatePolicy.arn;
  }

  public getChangeLambdaEventSourceMappingPolicyArn() {
    return this.changeLambdaEventSourceMappingPolicy.arn;
  }

  private createBackedAutoScalingGroupReadPolicy() {
    return new aws.iam.Policy("backend-auto-scaling-group-read-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "autoscaling:DescribeAutoScalingInstances",
            Resource: "*", // TODO Resource 좁히기
          },
        ],
      },
    });
  }

  private createBackedAutoScalingGroupUpdatePolicy() {
    return new aws.iam.Policy("backend-auto-scaling-group-update-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "autoscaling:DescribeAutoScalingInstances",
              "autoscaling:UpdateAutoScalingGroup",
            ],
            Resource: "*", // TODO Resource 좁히기
          },
        ],
      },
    });
  }

  private createBackendDeliveryCompleteQueueSendMessagePolicy() {
    return new aws.iam.Policy(
      "backend-delivery-complete-queue-send-message-policy",
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: "sqs:SendMessage",
              Resource: this.getBackendDeliveryCompletedQueueArn(),
            },
          ],
        },
      },
    );
  }

  private createBackendDeliveryCompleteQueuePurgeQueuePolicy() {
    return new aws.iam.Policy(
      "backend-delivery-complete-queue-purge-queue-policy",
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: "sqs:PurgeQueue",
              Resource: this.getBackendDeliveryCompletedQueueArn(),
            },
          ],
        },
      },
    );
  }

  private createCodeDeliveryParameterStoreUpdatePolicy() {
    return new aws.iam.Policy("code-delivery-parameter-store-update-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["ssm:PutParameter", "ssm:DeleteParameter"],
            Resource: pulumi.interpolate`arn:aws:ssm:${this.getCurrentRegion()}:${this.getAccountId()}:parameter${ParameterStoreInfo.CODE_DELIVERY_BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_NAME_KEY}`,
          },
        ],
      },
    });
  }

  private createChangeLambdaEventSourceMappingPolicy() {
    return new aws.iam.Policy("change-lambda-event-source-mapping-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "lambda:CreateEventSourceMapping",
              "lambda:DeleteEventSourceMapping",
            ],
            Resource: pulumi.interpolate`arn:aws:lambda:${this.getCurrentRegion()}:${this.getAccountId()}:event-source-mapping:*`,
          },
        ],
      },
    });
  }
}
