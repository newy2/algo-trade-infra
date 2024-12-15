import * as aws from "@pulumi/aws";
import { BucketV2 } from "@pulumi/aws/s3";
import * as pulumi from "@pulumi/pulumi";
import AwsConfig from "../../../../util/AwsConfig";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";
import LambdaInfo from "../../lambda/LambdaInfo";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";

export default class BucketInfo extends AwsConfig {
  private readonly appEnv: AppEnv;
  private readonly frontendBucket: BucketV2;

  constructor(appEnv: AppEnv) {
    super();

    this.appEnv = appEnv;
    this.frontendBucket = this.createFrontendBucket();
  }

  public getFrontendBucketRegionalDomainName() {
    return this.frontendBucket.bucketRegionalDomainName;
  }

  public setFrontendBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    const name = genName(this.appEnv, "frontend-bucket-policy");

    new aws.s3.BucketPolicy(name, {
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
                "AWS:SourceArn":
                  cloudFrontInfo.distributionInfo.getFrontendDistributionArn(),
              },
            },
          },
        ],
      },
    });
  }

  public setFrontendBucketNotification(lambdaInfo: LambdaInfo) {
    const prefix = genName(this.appEnv, "frontend-bucket");

    const allowBucket = new aws.lambda.Permission(
      genName(prefix, "lambda-permission"),
      {
        statementId: "AllowExecutionFromS3Bucket",
        action: "lambda:InvokeFunction",
        function: lambdaInfo.functionInfo.getFrontendDeliveryFunctionArn(),
        principal: "s3.amazonaws.com",
        sourceArn: this.frontendBucket.arn,
      },
    );

    new aws.s3.BucketNotification(
      genName(prefix, "notification"),
      {
        bucket: this.frontendBucket.id,
        lambdaFunctions: [
          {
            lambdaFunctionArn:
              lambdaInfo.functionInfo.getFrontendDeliveryFunctionArn(),
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
    const bucketName = genName(this.appEnv, this.getFrontendBucketName());

    const result = new aws.s3.BucketV2(bucketName, {
      bucket: bucketName,
      forceDestroy: true,
    });

    new aws.s3.BucketServerSideEncryptionConfigurationV2(
      genName(bucketName, "encryption"),
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
