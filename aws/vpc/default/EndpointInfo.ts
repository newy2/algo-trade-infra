import SecurityGroupInfo from "../security/SecurityGroupInfo";
import * as aws from "@pulumi/aws";
import SubnetInfo from "./SubnetInfo";

export default class EndpointInfo {
  constructor(subnetInfo: SubnetInfo, securityGroupInfo: SecurityGroupInfo) {
    this.createRdsConnectEndpoint(subnetInfo, securityGroupInfo);
  }

  private createRdsConnectEndpoint(
    subnetInfo: SubnetInfo,
    securityGroupInfo: SecurityGroupInfo,
  ) {
    return new aws.ec2transitgateway.InstanceConnectEndpoint(
      "ec2-instance-connect-endpoint",
      {
        subnetId: subnetInfo.getFirstPrivateSubnetId(),
        securityGroupIds: securityGroupInfo.getRdsSecurityGroupIds(),
        tags: {
          Name: "RDS Connect Endpoint",
        },
      },
      {
        deleteBeforeReplace: true,
      },
    );
  }
}
