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
    this.distribution = this.createDistribution(
      s3Info,
      functionInfo,
      originAccessInfo,
    );
  }

  public getDistributionArn() {
    return this.distribution.arn;
  }

  public getDistributionDomainName() {
    return this.distribution.domainName;
  }

  private createDistribution(
    s3Info: S3Info,
    functionInfo: FunctionInfo,
    originAccessInfo: OriginAccessInfo,
  ) {
    return new aws.cloudfront.Distribution(
      "front-end-algo-trade-distribution",
      {
        comment: "Static site distribution",
        customErrorResponses: this.getCustomErrorResponses(),
        defaultCacheBehavior: this.getDefaultCacheBehavior(
          s3Info,
          functionInfo,
        ),
        defaultRootObject: DistributionInfo.ROOT_OBJECT,
        enabled: true,
        httpVersion: "http2",
        isIpv6Enabled: true,
        orderedCacheBehaviors: this.getOrderedCacheBehaviors(s3Info),
        origins: [
          {
            domainName: s3Info.getBucketRegionalDomainName(),
            originId: s3Info.getBucketRegionalDomainName(),
            originAccessControlId: originAccessInfo.getOriginAccessControlId(),
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
      },
      {
        // retainOnDelete: true, // TODO Refector (retainOnDelete 옵션 사용시 연관된 resource 가 삭제되지 않는 현상 발생)
      },
    );
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
          functionArn: functionInfo.getGenerateRedirectUriFunctionArn(),
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
      targetOriginId: s3Info.getBucketRegionalDomainName(),
      viewerProtocolPolicy: "redirect-to-https",
    };
  }
}