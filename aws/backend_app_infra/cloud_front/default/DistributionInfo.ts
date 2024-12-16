import * as aws from "@pulumi/aws";
import { Distribution } from "@pulumi/aws/cloudfront";
import * as pulumi from "@pulumi/pulumi";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class DistributionInfo {
  private readonly backendDistribution: Distribution;

  constructor(appEnv: AppEnv, httpPort: number) {
    this.backendDistribution = this.createBackendDistribution(appEnv, httpPort);
  }

  public getBackendDistributionId() {
    return this.backendDistribution.id;
  }

  public getBackendDistributionFullDomainName() {
    return pulumi.interpolate`https://${this.backendDistribution.domainName}`;
  }

  private createBackendDistribution(appEnv: AppEnv, httpPort: number) {
    const fakeEc2PublicDns = "compute.amazonaws.com";
    const name = genName(appEnv, "backend-server-distribution");

    return new aws.cloudfront.Distribution(name, {
      comment: `[${appEnv}] Backend Server distribution`,
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
            httpPort: httpPort,
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
