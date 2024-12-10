import {
  DeleteParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient
} from "@aws-sdk/client-ssm";
import { validate } from "./util/utils.mjs";

export default class ParameterStore {
  static _PREFIX = "/code/delivery";
  static _SLACK_URL_KEY = `${ParameterStore._PREFIX}/slack/url`;
  static _BACKEND_AUTO_SCALING_GROUP_NAME_KEY = `${ParameterStore._PREFIX}/backend/auto_scaling_group/name`;
  static _BACKEND_DISTRIBUTION_ID_KEY = `${ParameterStore._PREFIX}/backend/cloudfront/distribution/id`;
  static _BACKEND_SQS_COMPLETE_URL_KEY = `${ParameterStore._PREFIX}/backend/sqs/complete/url`;
  static _BACKEND_SQS_COMPLETE_ARN_KEY = `${ParameterStore._PREFIX}/backend/sqs/complete/arn`;
  static _BACKEND_DELIVERY_COMPLETE_LAMBDA_NAME_KEY = `${ParameterStore._PREFIX}/backend/delivery_complete_lambda/name`;
  static _BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_KEY = `${ParameterStore._PREFIX}/backend/delivery_complete_lambda/event_source/uuid`;
  static _FRONTEND_DISTRIBUTION_ID_KEY = `${ParameterStore._PREFIX}/frontend/cloudfront/distribution/id`;
  static _FRONTEND_BUCKET_NAME_KEY = `${ParameterStore._PREFIX}/frontend/s3/bucket/name`;

  constructor() {
    this.ssmClient = new SSMClient();
    this.deliveryParameters = undefined;
  }

  async getSlackUrl() {
    return await this._getParameter(ParameterStore._SLACK_URL_KEY);
  }

  async getBackendAutoScalingGroupName() {
    return await this._getParameter(ParameterStore._BACKEND_AUTO_SCALING_GROUP_NAME_KEY);
  }

  async getBackendDistributionId() {
    return await this._getParameter(ParameterStore._BACKEND_DISTRIBUTION_ID_KEY);
  }

  async getBackendSqsCompleteArn() {
    return await this._getParameter(ParameterStore._BACKEND_SQS_COMPLETE_ARN_KEY);
  }

  async getBackendSqsCompleteUrl() {
    return await this._getParameter(ParameterStore._BACKEND_SQS_COMPLETE_URL_KEY);
  }

  async getBackendDeliveryCompleteLambdaName() {
    return await this._getParameter(ParameterStore._BACKEND_DELIVERY_COMPLETE_LAMBDA_NAME_KEY);
  }

  async getBackendDeliveryCompleteLambdaEventSourceUuid() {
    return await this._getParameter(ParameterStore._BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_KEY);
  }

  async getFrontendDistributionId() {
    return await this._getParameter(ParameterStore._FRONTEND_DISTRIBUTION_ID_KEY);
  }

  async getFrontendBucketName() {
    return await this._getParameter(ParameterStore._FRONTEND_BUCKET_NAME_KEY);
  }

  async setBackendDeliveryCompleteLambdaEventSourceUuid(uuid) {
    const response = await this.ssmClient.send(new PutParameterCommand({
      Name: ParameterStore._BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_KEY,
      Value: uuid,
      Type: "String",
      Overwrite: true
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async deleteBackendDeliveryCompleteLambdaEventSourceUuid() {
    const response = await this.ssmClient.send(new DeleteParameterCommand({
      Name: ParameterStore._BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_KEY
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async _getParameter(key) {
    if (!this.deliveryParameters) {
      this.deliveryParameters = await this._fetchParameter();
    }

    const result = this.deliveryParameters.find(each => each.Name === key);
    if (!result) {
      console.error("[ParameterStore] this.deliveryParameters: ", JSON.stringify(this.deliveryParameters, null, 2));
      console.error("[ParameterStore] key: ", key);
      throw Error(this.deliveryParameters);
    }

    return result.Value;
  }

  async _fetchParameter() {
    let results = [];
    let nextToken = undefined;

    do {
      const response = await this.ssmClient.send(new GetParametersByPathCommand({
        Path: ParameterStore._PREFIX,
        Recursive: true,
        NextToken: nextToken
      }));

      results = results.concat(response.Parameters);
      nextToken = response.NextToken;
    } while (nextToken);

    return results;
  }
}