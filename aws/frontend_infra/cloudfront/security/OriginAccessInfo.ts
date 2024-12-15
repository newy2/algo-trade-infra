import S3Info from "../../s3/S3Info";
import * as aws from "@pulumi/aws";
import { OriginAccessControl } from "@pulumi/aws/cloudfront";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class OriginAccessInfo {
  private readonly appEnv: AppEnv;
  private readonly frontendBucketOriginAccessControl: OriginAccessControl;

  constructor(appEnv: AppEnv, s3Info: S3Info) {
    this.appEnv = appEnv;
    this.frontendBucketOriginAccessControl =
      this.createFrontendBucketOriginAccessControl(s3Info);
  }

  public getFrontendBucketOriginAccessControlId() {
    return this.frontendBucketOriginAccessControl.id;
  }

  private createFrontendBucketOriginAccessControl(s3Info: S3Info) {
    const name = genName(this.appEnv, "origin-access-control");

    return new aws.cloudfront.OriginAccessControl(name, {
      description: `[${this.appEnv}] Front end S3 Bucket Access`,
      name: s3Info.bucketInfo.getFrontendBucketRegionalDomainName(),
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    });
  }
}
