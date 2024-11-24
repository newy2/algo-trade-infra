import * as aws from "@pulumi/aws";
import { BucketV2 } from "@pulumi/aws/s3";
import * as pulumi from "@pulumi/pulumi";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";

export default class BucketInfo {
  private readonly bucket: BucketV2;

  constructor() {
    this.bucket = this.createBucket();
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

  private createBucket() {
    const result = new aws.s3.BucketV2(
      "front-end-bucket",
      {
        bucket: "front-algo-trade",
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

    return result;
  }
}
