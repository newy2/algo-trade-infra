import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";

export default class PolicyInfo extends BaseAwsInfo {
  private readonly runCommandPolicy: Policy;
  private readonly codeDeliveryStateSnsPublishMessagePolicy: Policy;

  constructor() {
    super();

    this.runCommandPolicy = this.createRunCommandPolicy();
    this.codeDeliveryStateSnsPublishMessagePolicy =
      this.createCodeDeliveryStateSnsPublishMessagePolicy();
  }

  public getRunCommandPolicyArn() {
    return this.runCommandPolicy.arn;
  }

  public getCodeDeliveryStateSnsPublishMessagePolicy() {
    return this.codeDeliveryStateSnsPublishMessagePolicy.arn;
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

  private createCodeDeliveryStateSnsPublishMessagePolicy() {
    return new aws.iam.Policy("code-delivery-state-sns-public-message-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "sns:Publish",
            Resource: [this.getCodeDeliveryStateSnsTopicArn()],
          },
        ],
      },
    });
  }
}
