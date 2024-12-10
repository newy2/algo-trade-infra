import S3Info from "../../s3/S3Info";
import * as aws from "@pulumi/aws";
import { OriginAccessControl } from "@pulumi/aws/cloudfront";

export default class OriginAccessInfo {
  private readonly frontendBucketOriginAccessControl: OriginAccessControl;

  constructor(s3Info: S3Info) {
    this.frontendBucketOriginAccessControl =
      this.createFrontendBucketOriginAccessControl(s3Info);
  }

  public getFrontendBucketOriginAccessControlId() {
    return this.frontendBucketOriginAccessControl.id;
  }

  private createFrontendBucketOriginAccessControl(s3Info: S3Info) {
    return new aws.cloudfront.OriginAccessControl("origin-access-control", {
      description: "Front end S3 Bucket Access",
      name: s3Info.bucketInfo.getFrontendBucketRegionalDomainName(),
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    });
  }
}
