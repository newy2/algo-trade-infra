import BaseAwsInfo from "../../backend_infra/BaseAwsInfo";
import * as aws from "@pulumi/aws";
import SubnetInfo from "./default/SubnetInfo";
import RouteTableInfo from "./default/RouteTableInfo";
import InternetGatewayInfo from "./default/InternetGatewayInfo";
import SecurityGroupInfo from "./security/SecurityGroupInfo";
import NetworkAclInfo from "./security/NetworkAclInfo";
import EndpointInfo from "./default/EndpointInfo";
import { DefaultVpc } from "@pulumi/aws/ec2";

export default class VpcInfo extends BaseAwsInfo {
  public readonly defaultVpc: DefaultVpc;
  public readonly securityGroupInfo: SecurityGroupInfo;
  public readonly subnetInfo: SubnetInfo;
  public readonly endpointInfo: EndpointInfo;

  constructor() {
    super();

    this.defaultVpc = this.findDefaultVpc();
    const internetGatewayInfo = new InternetGatewayInfo(this.defaultVpc);
    this.securityGroupInfo = new SecurityGroupInfo(this.defaultVpc);
    this.subnetInfo = new SubnetInfo(this.defaultVpc);
    new NetworkAclInfo(this.defaultVpc);
    new RouteTableInfo(this.defaultVpc, internetGatewayInfo, this.subnetInfo);
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
