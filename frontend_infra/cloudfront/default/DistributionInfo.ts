import * as aws from "@pulumi/aws";
import { Distribution } from "@pulumi/aws/cloudfront";
import S3Info from "../../s3/S3Info";
import FunctionInfo from "./FunctionInfo";
import OriginAccessInfo from "../security/OriginAccessInfo";

export default class DistributionInfo {
  private static readonly ROOT_OBJECT = "index.html";
  private distribution: Distribution;

  constructor(
    s3Info: S3Info,
    functionInfo: FunctionInfo,
    originAccessInfo: OriginAccessInfo,
  ) {
    this.distribution = this.createFrontendDistribution(
      s3Info,
      functionInfo,
      originAccessInfo,
    );
  }

  public getFrontendDistributionArn() {
    return this.distribution.arn;
  }

  public getFrontendDistributionDomainName() {
    return this.distribution.domainName;
  }

  public getFrontendDistributionId() {
    return this.distribution.id;
  }

  private createFrontendDistribution(
    s3Info: S3Info,
    functionInfo: FunctionInfo,
    originAccessInfo: OriginAccessInfo,
  ) {
    return new aws.cloudfront.Distribution("frontend-algo-trade-distribution", {
      comment: "Static site distribution",
      customErrorResponses: this.getCustomErrorResponses(),
      defaultCacheBehavior: this.getDefaultCacheBehavior(s3Info, functionInfo),
      defaultRootObject: DistributionInfo.ROOT_OBJECT,
      enabled: true,
      httpVersion: "http2",
      orderedCacheBehaviors: this.getOrderedCacheBehaviors(s3Info),
      origins: [
        {
          domainName: s3Info.bucketInfo.getFrontendBucketRegionalDomainName(),
          originId: s3Info.bucketInfo.getFrontendBucketRegionalDomainName(),
          originAccessControlId:
            originAccessInfo.getFrontendBucketOriginAccessControlId(),
        },
      ],
      priceClass: "PriceClass_200",
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        cloudfrontDefaultCertificate: true,
        minimumProtocolVersion: "TLSv1",
      },
    });
  }

  private getCustomErrorResponses() {
    const errorCodes = [403, 404];
    return errorCodes.map((errorCode) => ({
      errorCode,
      responseCode: 200,
      errorCachingMinTtl: 10,
      responsePagePath: `/${DistributionInfo.ROOT_OBJECT}`,
    }));
  }

  private getOrderedCacheBehaviors(s3Info: S3Info) {
    const noRedirectionPatterns = ["/static/*", "/*.*"];

    return noRedirectionPatterns.map((pathPattern) => ({
      ...this.getCacheBehaviorDefaultOption(s3Info),
      pathPattern,
    }));
  }

  private getDefaultCacheBehavior(s3Info: S3Info, functionInfo: FunctionInfo) {
    return {
      ...this.getCacheBehaviorDefaultOption(s3Info),
      functionAssociations: [
        {
          eventType: "viewer-request",
          functionArn: functionInfo.getGenerateRedirectUrlFunctionArn(),
        },
      ],
    };
  }

  private getCacheBehaviorDefaultOption(s3Info: S3Info) {
    const cachePolicyId = aws.cloudfront.getCachePolicy({
      name: "Managed-CachingOptimized",
    });

    return {
      allowedMethods: ["GET", "HEAD"],
      cachedMethods: ["GET", "HEAD"],
      cachePolicyId: cachePolicyId.then((it) => it.id!),
      compress: true,
      targetOriginId: s3Info.bucketInfo.getFrontendBucketRegionalDomainName(),
      viewerProtocolPolicy: "redirect-to-https",
    };
  }
}
