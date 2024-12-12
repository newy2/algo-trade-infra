import BaseAwsInfo from "../../backend_infra/BaseAwsInfo";
import * as aws from "@pulumi/aws";
import SubnetInfo from "./default/SubnetInfo";
import RouteTableInfo from "./default/RouteTableInfo";
import InternetGatewayInfo from "./default/InternetGatewayInfo";
import SecurityGroupInfo from "./security/SecurityGroupInfo";
import NetworkAclInfo from "./security/NetworkAclInfo";
import EndpointInfo from "./default/EndpointInfo";

export default class VpcInfo extends BaseAwsInfo {
  public readonly securityGroupInfo: SecurityGroupInfo;
  public readonly subnetInfo: SubnetInfo;
  public readonly endpointInfo: EndpointInfo;

  constructor() {
    super();

    const defaultVpc = this.findDefaultVpc();
    const internetGatewayInfo = new InternetGatewayInfo(defaultVpc);
    this.securityGroupInfo = new SecurityGroupInfo(defaultVpc);
    this.subnetInfo = new SubnetInfo(defaultVpc);
    new NetworkAclInfo(defaultVpc);
    new RouteTableInfo(defaultVpc, internetGatewayInfo, this.subnetInfo);
    this.endpointInfo = new EndpointInfo(
      this.subnetInfo,
      this.securityGroupInfo,
    );
  }

  private findDefaultVpc() {
    return new aws.ec2.DefaultVpc("default-vpc", {
      tags: {
        Name: "Default VPC",
      },
    });
  }
}
