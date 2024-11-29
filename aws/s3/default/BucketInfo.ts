import * as aws from "@pulumi/aws";
import { BucketV2 } from "@pulumi/aws/s3";
import * as pulumi from "@pulumi/pulumi";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";
import LambdaInfo from "../../lambda/LambdaInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class BucketInfo extends BaseAwsInfo {
  private readonly bucket: BucketV2;

  constructor(lambdaInfo: LambdaInfo) {
    super();

    this.bucket = this.createBucket(lambdaInfo);
  }

  public getBucketRegionalDomainName() {
    return this.bucket.bucketRegionalDomainName;
  }

  public setBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    new aws.s3.BucketPolicy("bucketPolicy", {
      bucket: this.bucket.id,
      policy: pulumi.interpolate`{
        "Version": "2008-10-17",
        "Id": "PolicyForCloudFrontPrivateContent",
        "Statement": [
            {
                "Sid": "AllowCloudFrontServicePrincipal",
                "Effect": "Allow",
                "Principal": {
                    "Service": "cloudfront.amazonaws.com"
                },
                "Action": "s3:GetObject",
                "Resource": "${this.bucket.arn}/*",
                "Condition": {
                    "StringEquals": {
                        "AWS:SourceArn": "${cloudFrontInfo.getDistributionArn()}"
                    }
                }
            }
        ]
    }`,
    });
  }

  private createBucket(lambdaInfo: LambdaInfo) {
    const result = new aws.s3.BucketV2(
      "front-end-bucket",
      {
        bucket: this.getFrontendBucketName(),
        forceDestroy: true,
      },
      {
        // retainOnDelete: true, // TODO Refector
      },
    );

    new aws.s3.BucketServerSideEncryptionConfigurationV2("bucket-encryption", {
      bucket: result.id,
      rules: [
        {
          bucketKeyEnabled: true,
        },
      ],
    });

    this.createBucketNotification(result, lambdaInfo);

    return result;
  }

  private createBucketNotification(bucket: BucketV2, lambdaInfo: LambdaInfo) {
    const allowBucket = new aws.lambda.Permission("allow-bucket", {
      statementId: "AllowExecutionFromS3Bucket",
      action: "lambda:InvokeFunction",
      function: lambdaInfo.getFrontendDeployFunctionArn(),
      principal: "s3.amazonaws.com",
      sourceArn: bucket.arn,
    });

    new aws.s3.BucketNotification(
      "bucket-notification",
      {
        bucket: bucket.id,
        lambdaFunctions: [
          {
            lambdaFunctionArn: lambdaInfo.getFrontendDeployFunctionArn(),
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
}