import {
  CloudFrontClient,
  GetDistributionCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand
} from "@aws-sdk/client-cloudfront";
import { retryCall, validate } from "./utils.mjs";

export default class CloudFront {
  constructor(distributionId) {
    this.cloudFrontClient = new CloudFrontClient();
    this.distributionId = distributionId;
  }

  async isCurrentOriginDomainName(dnsName) {
    const configResponse = await this._getDistributionConfig();
    return dnsName === configResponse.DistributionConfig.Origins.Items[0].DomainName;
  }

  async _getDistributionConfig() {
    const distributionId = this.distributionId;
    return await this.cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: distributionId
    }));
  }

  async updateOriginDomainName(dnsName) {
    await this._updateOriginDomainName(dnsName);
    return await this._checkDeployStatus();
  }

  async _updateOriginDomainName(dnsName) {
    const distributionId = this.distributionId;
    const configResponse = await this.cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: distributionId
    }));

    const { DistributionConfig, ETag } = configResponse;

    DistributionConfig.Origins.Items[0].Id = dnsName;
    DistributionConfig.Origins.Items[0].DomainName = dnsName;
    DistributionConfig.DefaultCacheBehavior.TargetOriginId = dnsName;

    const response = await this.cloudFrontClient.send(new UpdateDistributionCommand({
      DistributionConfig,
      Id: distributionId,
      IfMatch: ETag
    }));

    const responseDistributionConfig = response.Distribution.DistributionConfig;
    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      },
      {
        key: "fistOrigin.Id",
        expected: dnsName,
        actual: responseDistributionConfig.Origins.Items[0].Id
      },
      {
        key: "fistOrigin.DomainName",
        expected: dnsName,
        actual: responseDistributionConfig.Origins.Items[0].DomainName
      },
      {
        key: "DefaultCacheBehavior.TargetOriginId",
        expected: dnsName,
        actual: responseDistributionConfig.DefaultCacheBehavior.TargetOriginId
      }
    ]);
  }

  async _checkDeployStatus() {
    return await retryCall({
      retryCount: 300,
      delay: 1000,
      func: async () => {
        const response = await this.cloudFrontClient.send(new GetDistributionCommand({
          Id: this.distributionId
        }));

        return "Deployed" === response.Distribution.Status;
      }
    });
  }
}
