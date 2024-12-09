import { GetParametersByPathCommand, SSMClient } from "@aws-sdk/client-ssm";

export default class ParameterStore {
  static _PREFIX = "/code/delivery";
  static _SLACK_URL_KEY = `${ParameterStore._PREFIX}/slack/url`;

  constructor() {
    this.ssmClient = new SSMClient();
    this.deliveryParameter = undefined;
  }

  async getSlackUrl() {

    return await this._getParameter(ParameterStore._SLACK_URL_KEY);
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