import S3Info from "../../s3/S3Info";
import * as aws from "@pulumi/aws";
import { OriginAccessControl } from "@pulumi/aws/cloudfront";

export default class OriginAccessInfo {
  private readonly originAccessControl: OriginAccessControl;

  constructor(s3Info: S3Info) {
    this.originAccessControl = this.createOriginAccessControl(s3Info);
  }

  public getOriginAccessControlId() {
    return this.originAccessControl.id;
  }

  private createOriginAccessControl(s3Info: S3Info) {
    return new aws.cloudfront.OriginAccessControl(
      "origin-access-control",
      {
        description: "Front end S3 Bucket Access",
        name: s3Info.getBucketRegionalDomainName(),
        originAccessControlOriginType: "s3",
        signingBehavior: "always",
        signingProtocol: "sigv4",
      },
      {
        // retainOnDelete: true, // TODO Refector
      },
    );
  }
}
