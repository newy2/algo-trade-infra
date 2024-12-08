import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2";

export default class Ec2List {
  constructor() {
    this.ec2Client = new EC2Client();
  }

  async getOldestInstanceId(instanceIds) {
    const response = await this.ec2Client.send(new DescribeInstancesCommand({
      "InstanceIds": instanceIds
    }));

    const ascendingList = response.Reservations
      .map(each => each.Instances[0])
      .sort((a, b) => {
        return new Date(a.LaunchTime).getTime() - new Date(b.LaunchTime).getTime();
      });

    return ascendingList[0].InstanceId;
  }
}
