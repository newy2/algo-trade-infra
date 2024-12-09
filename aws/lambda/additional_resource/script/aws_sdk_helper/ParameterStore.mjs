import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

export default class ParameterStore {
  static _PREFIX = "/code/delivery";
  static _SLACK_URL_KEY = `${ParameterStore._PREFIX}/slack/url`;
  static _BACKEND_DISTRIBUTION_ID_KEY = `${ParameterStore._PREFIX}/backend/cloudfront/distribution/id`;
  static _BACKEND_SQS_COMPLETE_URL_KEY = `${ParameterStore._PREFIX}/backend/sqs/complete/url`;
  static _FRONTEND_DISTRIBUTION_ID_KEY = `${ParameterStore._PREFIX}/frontend/cloudfront/distribution/id`;

  constructor() {
    this.ssmClient = new SSMClient();
    this.deliveryParameter = undefined;
  }

  async getSlackUrl() {
    return await this._getParameter(ParameterStore._SLACK_URL_KEY);
  }

  async getBackendDistributionId() {
    return await this._getParameter(ParameterStore._BACKEND_DISTRIBUTION_ID_KEY);
  }

  async getBackendSqsCompleteUrl() {
    return await this._getParameter(ParameterStore._BACKEND_SQS_COMPLETE_URL_KEY);
  }

  async getFrontendDistributionId() {
    return await this._getParameter(ParameterStore._FRONTEND_DISTRIBUTION_ID_KEY);
  }

  async _getParameter(key) {
    if (!this.deliveryParameter) {
      const response = await this.ssmClient.send(new GetParametersByPathCommand({
        Path: ParameterStore._PREFIX,
        Recursive: true
      }));
      this.deliveryParameter = response.Parameters;
    }

    return this.deliveryParameter.find(each => each.Name === key).Value;
  }
}