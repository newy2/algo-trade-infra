import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";
import { retryCall } from "./util/utils.mjs";

export default class Ec2 {
  constructor(instanceId, httpPort) {
    this.ec2Client = new EC2Client();
    this.instanceId = instanceId;
    this.httpPort = httpPort;
  }

  async checkHealthyApi() {
    const healthCheckUrl = await this.getHealthCheckUrl();

    return await retryCall({
      retryCount: 60,
      delay: 1000,
      func: async () => {
        const response = await fetch(healthCheckUrl, {
          method: "GET"
        });

        return response.status === 200;
      }
    });
  }

  async getHealthCheckUrl() {
    return `http://${await this.getPublicDnsName()}:${this.httpPort}/ping`;
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
