import {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetDistributionCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand
} from "@aws-sdk/client-cloudfront";
import { retryCall, validate } from "./util/utils.mjs";

export default class CloudFront {
  constructor(distributionId) {
    this._cloudFrontClient = new CloudFrontClient();
    this._distributionId = distributionId;
  }

  async isCurrentOriginDomainName(dnsName) {
    const configResponse = await this._getDistributionConfig();
    return dnsName === configResponse.DistributionConfig.Origins.Items[0].DomainName;
  }

  async updateBackendOriginDomainName(dnsName) {
    await this._updateOriginDomainName(dnsName);
    return await this._checkDeployStatus();
  }

  async updateFrontendOriginPath(originPath) {
    await this._updateDistributionOriginPath(originPath);
    await this._sendInvalidationAll();
    return await this._checkDeployStatus();
  }

  async _getDistributionConfig() {
    return await this._cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: this._distributionId
    }));
  }

  async _updateOriginDomainName(dnsName) {
    const distributionId = this._distributionId;
    const configResponse = await this._cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: distributionId
    }));

    const { DistributionConfig, ETag } = configResponse;

    DistributionConfig.Origins.Items[0].Id = dnsName;
    DistributionConfig.Origins.Items[0].DomainName = dnsName;
    DistributionConfig.DefaultCacheBehavior.TargetOriginId = dnsName;

    const response = await this._cloudFrontClient.send(new UpdateDistributionCommand({
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

  async _updateDistributionOriginPath(originPath) {
    const configResponse = await this._cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: this._distributionId
    }));

    const { DistributionConfig, ETag } = configResponse;
    DistributionConfig.Origins.Items[0].OriginPath = originPath;

    const response = await this._cloudFrontClient.send(new UpdateDistributionCommand({
      DistributionConfig,
      Id: this._distributionId,
      IfMatch: ETag
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      },
      {
        key: "fistOrigin.OriginPath",
        expected: originPath,
        actual: response.Distribution.DistributionConfig.Origins.Items[0].OriginPath
      }
    ]);
  }

  async _sendInvalidationAll() {
    const allPath = "/*";
    const response = await this._cloudFrontClient.send(new CreateInvalidationCommand({
      DistributionId: this._distributionId,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: [allPath]
        }
      }
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 201,
        actual: response["$metadata"].httpStatusCode
      },
      {
        key: "fistInvalidation.Path",
        expected: allPath,
        actual: response.Invalidation.InvalidationBatch.Paths.Items[0]
      }
    ]);
  }

  async _checkDeployStatus() {
    return await retryCall({
      retryCount: 300,
      delay: 1000,
      func: async () => {
        const response = await this._cloudFrontClient.send(new GetDistributionCommand({
          Id: this._distributionId
        }));

        return "Deployed" === response.Distribution.Status;
      }
    });
  }
}
