import AwsConfig from "../../../../util/AwsConfig";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";
import ParameterStoreInfo from "../../../backend_infra/ssm/application_management/ParameterStoreInfo";

export default class PolicyInfo extends AwsConfig {
  private readonly cloudFrontUpdatePolicy: Policy;
  private readonly codeDeliveryParameterStoreReadPolicy: Policy;
  public readonly backendCodeDeliveryPolicyInfo: BackendCodeDeliveryPolicyInfo;

  constructor() {
    super();

    this.cloudFrontUpdatePolicy = this.createCloudFrontUpdatePolicy();
    this.codeDeliveryParameterStoreReadPolicy =
      this.createCodeDeliveryParameterStoreReadPolicy();
    this.backendCodeDeliveryPolicyInfo = new BackendCodeDeliveryPolicyInfo();
  }

  public getCloudFrontUpdatePolicyArn() {
    return this.cloudFrontUpdatePolicy.arn;
  }

  public getCodeDeliveryParameterStoreReadPolicyArn() {
    return this.codeDeliveryParameterStoreReadPolicy.arn;
  }

  private createCloudFrontUpdatePolicy() {
    return new aws.iam.Policy("cloud-front-update-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "cloudfront:GetDistribution",
              "cloudfront:GetDistributionConfig",
              "cloudfront:UpdateDistribution",
              "cloudfront:CreateInvalidation",
              "ec2:DescribeInstances",
            ],
            Resource: "*", // TODO Resource 좁히기
          },
        ],
      },
    });
  }

  private createCodeDeliveryParameterStoreReadPolicy() {
    return new aws.iam.Policy("code-delivery-parameter-store-read-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "ssm:GetParametersByPath",
            Resource: pulumi.interpolate`arn:aws:ssm:${this.getCurrentRegion()}:${this.getAccountId()}:parameter/code*`,
          },
        ],
      },
    });
  }
}

class BackendCodeDeliveryPolicyInfo extends AwsConfig {
  private readonly requestScaleDownQueueSendMessagePolicy: Policy;
  private readonly requestScaleDownQueuePurgeQueuePolicy: Policy;
  private readonly autoScalingGroupReadPolicy: Policy;
  private readonly autoScalingGroupUpdatePolicy: Policy;
  private readonly parameterStoreUpdatePolicy: Policy;
  private readonly ecrImageReadPolicy: Policy;
  private readonly lambdaEventSourceMappingUpdatePolicy: Policy;

  constructor() {
    super();

    this.requestScaleDownQueueSendMessagePolicy =
      this.createRequestScaleDownQueueSendMessagePolicy();
    this.requestScaleDownQueuePurgeQueuePolicy =
      this.createRequestScaleDownQueuePurgeQueuePolicy();
    this.autoScalingGroupReadPolicy = this.createAutoScalingGroupReadPolicy();
    this.autoScalingGroupUpdatePolicy =
      this.createAutoScalingGroupUpdatePolicy();
    this.parameterStoreUpdatePolicy = this.createParameterStoreUpdatePolicy();
    this.ecrImageReadPolicy = this.createEcrImageReadPolicy();
    this.lambdaEventSourceMappingUpdatePolicy =
      this.createLambdaEventSourceMappingUpdatePolicy();
  }

  public getRequestScaleDownQueueSendMessagePolicyArn() {
    return this.requestScaleDownQueueSendMessagePolicy.arn;
  }

  public getRequestScaleDownQueuePurgeQueuePolicyArn() {
    return this.requestScaleDownQueuePurgeQueuePolicy.arn;
  }

  public getAutoScalingGroupReadPolicyArn() {
    return this.autoScalingGroupReadPolicy.arn;
  }

  public getAutoScalingGroupUpdatePolicyArn() {
    return this.autoScalingGroupUpdatePolicy.arn;
  }

  public getParameterStoreUpdatePolicyArn() {
    return this.parameterStoreUpdatePolicy.arn;
  }

  public getEcrImageReadPolicyArn() {
    return this.ecrImageReadPolicy.arn;
  }

  public getChangeLambdaEventSourceMappingPolicyArn() {
    return this.lambdaEventSourceMappingUpdatePolicy.arn;
  }

  private createAutoScalingGroupReadPolicy() {
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

  private createAutoScalingGroupUpdatePolicy() {
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

  private createRequestScaleDownQueueSendMessagePolicy() {
    return new aws.iam.Policy(
      "backend-delivery-request-scale-down-queue-send-message-policy",
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: "sqs:SendMessage",
              Resource: this.getBackendDeliveryRequestScaleDownQueueArn(),
            },
          ],
        },
      },
    );
  }

  private createRequestScaleDownQueuePurgeQueuePolicy() {
    return new aws.iam.Policy(
      "backend-delivery-request-scale-down-queue-purge-queue-policy",
      {
        policy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Action: "sqs:PurgeQueue",
              Resource: this.getBackendDeliveryRequestScaleDownQueueArn(),
            },
          ],
        },
      },
    );
  }

  private createParameterStoreUpdatePolicy() {
    return new aws.iam.Policy("code-delivery-parameter-store-update-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["ssm:PutParameter", "ssm:DeleteParameter"],
            Resource: pulumi.interpolate`arn:aws:ssm:${this.getCurrentRegion()}:${this.getAccountId()}:parameter${ParameterStoreInfo.CODE_DELIVERY_BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_NAME_KEY}`,
          },
        ],
      },
    });
  }

  private createEcrImageReadPolicy() {
    return new aws.iam.Policy("code-delivery-ecr-image-read-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "ecr:DescribeImages",
            Resource: "*",
          },
        ],
      },
    });
  }

  private createLambdaEventSourceMappingUpdatePolicy() {
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
