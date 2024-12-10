import * as aws from "@pulumi/aws";
import { Distribution } from "@pulumi/aws/cloudfront";
import S3Info from "../../s3/S3Info";
import FunctionInfo from "./FunctionInfo";
import OriginAccessInfo from "../security/OriginAccessInfo";

export default class DistributionInfo {
  private static readonly ROOT_OBJECT = "index.html";
  private frontendDistribution: Distribution;
  private backendDistribution: Distribution;

  constructor(
    s3Info: S3Info,
    functionInfo: FunctionInfo,
    originAccessInfo: OriginAccessInfo,
  ) {
    this.frontendDistribution = this.createFrontendDistribution(
      s3Info,
      functionInfo,
      originAccessInfo,
    );
    this.backendDistribution = this.createBackendDistribution();
  }

  public getFrontendDistributionArn() {
    return this.frontendDistribution.arn;
  }

  public getFrontendDistributionDomainName() {
    return this.frontendDistribution.domainName;
  }

  public getFrontendDistributionId() {
    return this.frontendDistribution.id;
  }

  public getBackendDistributionId() {
    return this.backendDistribution.id;
  }

  public getBackendDistributionDomainName() {
    return this.backendDistribution.domainName;
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
          domainName: s3Info.getFrontendBucketRegionalDomainName(),
          originId: s3Info.getFrontendBucketRegionalDomainName(),
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
      targetOriginId: s3Info.getFrontendBucketRegionalDomainName(),
      viewerProtocolPolicy: "redirect-to-https",
    };
  }

  private createBackendDistribution() {
    const fakeEc2PublicDns = "compute.amazonaws.com";

    return new aws.cloudfront.Distribution("backend-server-distribution", {
      comment: "Backend Server distribution",
      defaultCacheBehavior: {
        targetOriginId: fakeEc2PublicDns,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: [
          "GET",
          "HEAD",
          "OPTIONS",
          "PUT",
          "POST",
          "PATCH",
          "DELETE",
        ],
        cachePolicyId: "83da9c7e-98b4-4e11-a168-04f0df8e2c65",
        cachedMethods: ["GET", "HEAD"],
        compress: true,
        originRequestPolicyId: "216adef6-5c7f-47e4-b989-5492eafa07d3",
      },
      enabled: true,
      httpVersion: "http2",
      origins: [
        {
          customOriginConfig: {
            httpPort: 80,
            httpsPort: 443,
            originProtocolPolicy: "http-only",
            originSslProtocols: ["SSLv3", "TLSv1", "TLSv1.1", "TLSv1.2"],
          },
          domainName: fakeEc2PublicDns,
          originId: fakeEc2PublicDns,
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
}
