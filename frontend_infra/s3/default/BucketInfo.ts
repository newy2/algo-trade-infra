import * as aws from "@pulumi/aws";
import { BucketV2 } from "@pulumi/aws/s3";
import * as pulumi from "@pulumi/pulumi";
import BaseAwsInfo from "../../../aws/BaseAwsInfo";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";
import LambdaInfo from "../../lambda/LambdaInfo";

export default class BucketInfo extends BaseAwsInfo {
  private readonly frontendBucket: BucketV2;

  constructor() {
    super();

    this.frontendBucket = this.createFrontendBucket();
  }

  public getFrontendBucketRegionalDomainName() {
    return this.frontendBucket.bucketRegionalDomainName;
  }

  public setFrontendBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    new aws.s3.BucketPolicy("frontend-bucket-policy", {
      bucket: this.frontendBucket.id,
      policy: {
        Version: "2008-10-17",
        Id: "PolicyForCloudFrontPrivateContent",
        Statement: [
          {
            Sid: "AllowCloudFrontServicePrincipal",
            Effect: "Allow",
            Principal: {
              Service: "cloudfront.amazonaws.com",
            },
            Action: "s3:GetObject",
            Resource: pulumi.interpolate`${this.frontendBucket.arn}/*`,
            Condition: {
              StringEquals: {
                "AWS:SourceArn": pulumi.interpolate`${cloudFrontInfo.distributionInfo.getFrontendDistributionArn()}`,
              },
            },
          },
        ],
      },
    });
  }

  public setFrontendBucketNotification(lambdaInfo: LambdaInfo) {
    const allowBucket = new aws.lambda.Permission(
      "frontend-bucket-lambda-permission",
      {
        statementId: "AllowExecutionFromS3Bucket",
        action: "lambda:InvokeFunction",
        function:
          lambdaInfo.frontendFunctionInfo.getFrontendDeliveryFunctionArn(),
        principal: "s3.amazonaws.com",
        sourceArn: this.frontendBucket.arn,
      },
    );

    new aws.s3.BucketNotification(
      "frontend-bucket-notification",
      {
        bucket: this.frontendBucket.id,
        lambdaFunctions: [
          {
            lambdaFunctionArn:
              lambdaInfo.frontendFunctionInfo.getFrontendDeliveryFunctionArn(),
            events: ["s3:ObjectCreated:*"],
            filterSuffix: "index.html",
          },
        ],
      },
      {
        dependsOn: [allowBucket],
      },
    );
  }

  private createFrontendBucket() {
    const bucketName = this.getFrontendBucketName();

    const result = new aws.s3.BucketV2(bucketName, {
      bucket: bucketName,
      forceDestroy: true,
    });

    new aws.s3.BucketServerSideEncryptionConfigurationV2(
      "frontend-bucket-encryption",
      {
        bucket: result.id,
        rules: [
          {
            bucketKeyEnabled: true,
          },
        ],
      },
    );

    return result;
  }
}
