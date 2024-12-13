import * as aws from "@pulumi/aws";
import { Distribution } from "@pulumi/aws/cloudfront";
import * as pulumi from "@pulumi/pulumi";

export default class DistributionInfo {
  private readonly backendDistribution: Distribution;

  constructor() {
    this.backendDistribution = this.createBackendDistribution();
  }

  public getBackendDistributionId() {
    return this.backendDistribution.id;
  }

  public getBackendDistributionFullDomainName() {
    return pulumi.interpolate`https://${this.backendDistribution.domainName}`;
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
            httpPort: 8080,
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
