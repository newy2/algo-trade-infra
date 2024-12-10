import BaseAwsInfo from "../../../backend_infra/BaseAwsInfo";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";

export default class CommonPolicyInfo extends BaseAwsInfo {
  private readonly cloudFrontUpdatePolicy: Policy;
  private readonly codeDeliveryParameterStoreReadPolicy: Policy;

  constructor() {
    super();

    this.cloudFrontUpdatePolicy = this.createCloudFrontUpdatePolicy();
    this.codeDeliveryParameterStoreReadPolicy =
      this.createCodeDeliveryParameterStoreReadPolicy();
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
