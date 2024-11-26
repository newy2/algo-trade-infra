import * as aws from "@pulumi/aws";
import { IamInfo } from "../../iam/IamInfo";
import VpcInfo from "../../vpc/VpcInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class InstanceInfo extends BaseAwsInfo {
  private static FREE_TIER_OPTION = {
    instanceType: aws.ec2.InstanceType.T2_Micro,
  };

  private initScript = `#!/bin/bash
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -aG docker ec2-user
`;

  readonly instance: aws.ec2.Instance;

  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    super();

    this.instance = this.createEc2Instance(vpcInfo, iamInfo);
  }

  private createEc2Instance(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    return new aws.ec2.Instance("algo-trade-server", {
      ...InstanceInfo.FREE_TIER_OPTION,
      vpcSecurityGroupIds: vpcInfo.getEc2SecurityGroupIds(),
      iamInstanceProfile: iamInfo.getEc2InstanceProfileId(),
      subnetId: vpcInfo.getFirstPublicSubnetId(),
      ami: this.getAmiId(),
      userData: this.initScript,
      tags: {
        Name: this.getEc2ServerName(),
      },
    });
  }

  private getAmiId() {
    return aws.ec2
      .getAmi({
        mostRecent: true,
        owners: ["amazon"],
        filters: [
          { name: "name", values: ["al2023-ami-2023*"] },
          // {name: "name", values: ["amzn2-ami-hvm-*"]},
          { name: "architecture", values: ["x86_64"] },
          { name: "virtualization-type", values: ["hvm"] },
        ],
      })
      .then((it) => it.id);
  }
}