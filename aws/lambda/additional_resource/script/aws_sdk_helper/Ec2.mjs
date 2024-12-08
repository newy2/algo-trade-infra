import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import { retryCall } from "./utils.mjs";
import ApiHelper from "./common/ApiHelper.mjs";

export default class Ec2 {
  constructor(instanceId) {
    this.ec2Client = new EC2Client();
    this.instanceId = instanceId;
  }

  async checkHealthyApi() {
    const healthCheckUrl = await this.getHealthCheckUrl();

    return await retryCall({
      retryCount: 60,
      delay: 1000,
      func: async () => {
        const response = await new ApiHelper().call({
          url: healthCheckUrl,
          method: "GET"
        });

        return response.statusCode === 200;
      }
    });
  }

  async getHealthCheckUrl() {
    return `http://${await this.getPublicDnsName()}/ping`;
  }

  async getPublicDnsName() {
    return (await this._getInstance()).PublicDnsName;
  }

  async _getInstance() {
    if (!this.instance) {
      const response = await this.ec2Client.send(new DescribeInstancesCommand({
        InstanceIds: [this.instanceId]
      }));
      this.instance = response.Reservations[0].Instances[0];
    }
    return this.instance;
  }
}
