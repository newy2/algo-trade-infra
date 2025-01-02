import SecurityGroupInfo from "../security/SecurityGroupInfo";
import * as aws from "@pulumi/aws";
import SubnetInfo from "./SubnetInfo";
import { InstanceConnectEndpoint } from "@pulumi/aws/ec2transitgateway";

export default class EndpointInfo {
  private readonly rdsConnectEndpoint: InstanceConnectEndpoint;

  constructor(subnetInfo: SubnetInfo, securityGroupInfo: SecurityGroupInfo) {
    this.rdsConnectEndpoint = this.createRdsConnectEndpoint(
      subnetInfo,
      securityGroupInfo,
    );
  }

  public getRdsConnectEndpointId() {
    return this.rdsConnectEndpoint.id;
  }

  private createRdsConnectEndpoint(
    subnetInfo: SubnetInfo,
    securityGroupInfo: SecurityGroupInfo,
  ) {
    return new aws.ec2transitgateway.InstanceConnectEndpoint(
      "ec2-instance-connect-endpoint",
      {
        subnetId: subnetInfo.getFirstPrivateSubnetId(),
        securityGroupIds: securityGroupInfo.getEiceSecurityGroupIds(),
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
