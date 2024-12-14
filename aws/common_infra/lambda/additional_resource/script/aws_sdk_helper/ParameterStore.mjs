import {
  DeleteParameterCommand,
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient
} from "@aws-sdk/client-ssm";
import { validate } from "./util/utils.mjs";

export default class ParameterStore {
  static _SLACK_URL_KEY = "/code/delivery/slack/url";
  static _BACKEND_AUTO_SCALING_GROUP_NAME_KEY = "/code/delivery/backend/auto_scaling_group/name";
  static _BACKEND_SQS_REQUEST_SCALE_DOWN_URL_KEY = "/code/delivery/backend/sqs/request_scale_down/url";
  static _BACKEND_SQS_REQUEST_SCALE_DOWN_ARN_KEY = "/code/delivery/backend/sqs/request_scale_down/arn";
  static _BACKEND_SCALE_DOWN_LAMBDA_NAME_KEY = "/code/delivery/backend/lambda/scale_down/name";
  static _BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_KEY = "/code/delivery/backend/lambda/scale_down/event_source/uuid";

  static _BACKEND_DISTRIBUTION_ID_KEY = "/code/delivery/{appEnv}/backend/cloudfront/distribution/id";
  static _BACKEND_EC2_HTTP_PORT_KEY = "/code/delivery/{appEnv}/backend/ec2/http/port";
  static _BACKEND_ECR_REPOSITORY_NAME_KEY = "/code/delivery/{appEnv}/backend/ecr/repository/name";
  static _FRONTEND_DISTRIBUTION_ID_KEY = "/code/delivery/{appEnv}/frontend/cloudfront/distribution/id";
  static _FRONTEND_BUCKET_NAME_KEY = "/code/delivery/{appEnv}/frontend/s3/bucket/name";

  constructor(appEnv) {
    this.appEnv = appEnv;
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

  async getBackendEc2HttpPort() {
    return await this._getParameter(ParameterStore._BACKEND_EC2_HTTP_PORT_KEY);
  }

  async getBackendEcrRepositoryName() {
    return await this._getParameter(ParameterStore._BACKEND_ECR_REPOSITORY_NAME_KEY);
  }

  async getBackendRequestScaleDownSqsArn() {
    return await this._getParameter(ParameterStore._BACKEND_SQS_REQUEST_SCALE_DOWN_ARN_KEY);
  }

  async getBackendRequestScaleDownSqsUrl() {
    return await this._getParameter(ParameterStore._BACKEND_SQS_REQUEST_SCALE_DOWN_URL_KEY);
  }

  async getBackendDeliveryScaleDownLambdaName() {
    return await this._getParameter(ParameterStore._BACKEND_SCALE_DOWN_LAMBDA_NAME_KEY);
  }

  async getBackendDeliveryScaleDownLambdaEventSourceUuid() {
    return await this._getParameter(ParameterStore._BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_KEY);
  }

  async getFrontendDistributionId() {
    return await this._getParameter(ParameterStore._FRONTEND_DISTRIBUTION_ID_KEY);
  }

  async getFrontendBucketName() {
    return await this._getParameter(ParameterStore._FRONTEND_BUCKET_NAME_KEY);
  }

  async setBackendDeliveryScaleDownLambdaEventSourceUuid(uuid) {
    const response = await this.ssmClient.send(new PutParameterCommand({
      Name: ParameterStore._BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_KEY,
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

  async deleteBackendDeliveryScaleDownLambdaEventSourceUuid() {
    const response = await this.ssmClient.send(new DeleteParameterCommand({
      Name: ParameterStore._BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_KEY
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async _getParameter(originKey) {
    if (!this.deliveryParameters) {
      this.deliveryParameters = await this._fetchParameter();
    }

    const replaceKey = this._getReplaceKey(originKey, this.appEnv);
    const result = this.deliveryParameters.find(each => each.Name === replaceKey);
    if (!result) {
      console.error("[ParameterStore] this.deliveryParameters: ", JSON.stringify(this.deliveryParameters, null, 2));
      console.error("[ParameterStore] originKey: ", originKey);
      console.error("[ParameterStore] replaceKey: ", replaceKey);
      throw Error(this.deliveryParameters);
    }

    return result.Value;
  }

  async _fetchParameter() {
    let results = [];
    let nextToken = undefined;

    do {
      const response = await this.ssmClient.send(new GetParametersByPathCommand({
        Path: "/code/delivery",
        Recursive: true,
        NextToken: nextToken
      }));

      results = results.concat(response.Parameters);
      nextToken = response.NextToken;
    } while (nextToken);

    return results;
  }

  _getReplaceKey(format, replaceString) {
    return format.replace(new RegExp("{appEnv}", "g"), replaceString);
  }
}