import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";

export default class PolicyInfo extends BaseAwsInfo {
  private readonly runCommandPolicy: Policy;
  private readonly backendDeliveryCompleteQueueSendMessagePolicy: Policy;
  private readonly backendDeliveryCompleteQueuePurgeQueuePolicy: Policy;
  private readonly backedAutoScalingGroupUpdatePolicy: Policy;
  private readonly cloudFrontUpdatePolicy: Policy;
  private readonly codeDeliveryParameterStoreAccessPolicy: Policy;

  constructor() {
    super();

    this.runCommandPolicy = this.createRunCommandPolicy();
    this.backendDeliveryCompleteQueueSendMessagePolicy =
      this.createBackendDeliveryCompleteQueueSendMessagePolicy();
    this.backendDeliveryCompleteQueuePurgeQueuePolicy =
      this.createBackendDeliveryCompleteQueuePurgeQueuePolicy();
    this.backedAutoScalingGroupUpdatePolicy =
      this.createBackedAutoScalingGroupUpdatePolicy();
    this.cloudFrontUpdatePolicy = this.createCloudFrontUpdatePolicy();
    this.codeDeliveryParameterStoreAccessPolicy =
      this.createCodeDeliveryParameterStoreAccessPolicy();
  }

  public getRunCommandPolicyArn() {
    return this.runCommandPolicy.arn;
  }

  public getBackendDeliveryCompleteQueueSendMessagePolicyArn() {
    return this.backendDeliveryCompleteQueueSendMessagePolicy.arn;
  }

  public getBackendDeliveryCompleteQueuePurgeQueuePolicyArn() {
    return this.backendDeliveryCompleteQueuePurgeQueuePolicy.arn;
  }

  public getBackedAutoScalingGroupUpdatePolicyArn() {
    return this.backedAutoScalingGroupUpdatePolicy.arn;
  }

  public getCloudFrontUpdatePolicyArn() {
    return this.cloudFrontUpdatePolicy.arn;
  }

  public getCodeDeliveryParameterStoreAccessPolicyArn() {
    return this.codeDeliveryParameterStoreAccessPolicy.arn;
  }

  private createRunCommandPolicy() {
    return new aws.iam.Policy("ssm-run-command-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "ssm:SendCommand",
            Resource: [
              `arn:aws:ssm:${this.getCurrentRegion()}:*:document/AWS-RunShellScript`,
            ],
          },
          {
            Action: "ssm:SendCommand",
            Effect: "Allow",
            Resource: [
              pulumi.interpolate`arn:aws:ec2:${this.getCurrentRegion()}:${this.getAccountId()}:instance/*`,
            ],
            Condition: {
              StringEquals: {
                "ec2:ResourceTag/*": [this.getEc2ServerName()],
              },
            },
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
              "ec2:DescribeInstances",
            ],
            Resource: "*", // TODO Resource 좁히기
          },
        ],
      },
    });
  }

  private createCodeDeliveryParameterStoreAccessPolicy() {
    return new aws.iam.Policy("code-delivery-parameter-store-access-policy", {
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
