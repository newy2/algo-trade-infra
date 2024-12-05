import BaseAwsInfo from "../BaseAwsInfo";
import { DefaultVpc } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import SubnetInfo from "./default/SubnetInfo";
import RouteTableInfo from "./default/RouteTableInfo";
import InternetGatewayInfo from "./default/InternetGatewayInfo";
import SecurityGroupInfo from "./security/SecurityGroupInfo";
import NetworkAclInfo from "./security/NetworkAclInfo";
import EndpointInfo from "./default/EndpointInfo";

export default class VpcInfo extends BaseAwsInfo {
  readonly defaultVpc: DefaultVpc;
  private readonly internetGatewayInfo: InternetGatewayInfo;
  private readonly securityGroupInfo: SecurityGroupInfo;
  private readonly subnetInfo: SubnetInfo;
  private readonly networkAclInfo: NetworkAclInfo;
  private readonly routeTableInfo: RouteTableInfo;
  private readonly endpointInfo: EndpointInfo;

  constructor() {
    super();

    this.defaultVpc = this.findDefaultVpc();
    this.internetGatewayInfo = new InternetGatewayInfo(this.defaultVpc);
    this.securityGroupInfo = new SecurityGroupInfo(this.defaultVpc);
    this.subnetInfo = new SubnetInfo(this.defaultVpc);
    this.networkAclInfo = new NetworkAclInfo(this.defaultVpc);
    this.routeTableInfo = new RouteTableInfo(
      this.defaultVpc,
      this.internetGatewayInfo,
      this.subnetInfo,
    );
    this.endpointInfo = new EndpointInfo(
      this.subnetInfo,
      this.securityGroupInfo,
    );
  }

  public getRdsConnectEndpointId() {
    return this.endpointInfo.getRdsConnectEndpointId();
  }

  public getRdsSecurityGroupIds() {
    return this.securityGroupInfo.getRdsSecurityGroupIds();
  }

  public getEc2SecurityGroupIds() {
    return this.securityGroupInfo.getEc2SecurityGroupIds();
  }

  public getLoadBalancerSecurityGroupIds() {
    return this.securityGroupInfo.getLoadBalancerSecurityGroupIds();
  }

  public getRdsSubnetGroupIds() {
    return this.subnetInfo.getRdsSubnetGroupIds();
  }

  public getLoadBalancerSubnetIds() {
    return this.subnetInfo.getLoadBalancerSubnetIds();
  }

  public getFirstPublicSubnetId() {
    return this.subnetInfo.getFirstPublicSubnetId();
  }

  getDefaultVpcId() {
    return this.defaultVpc.id;
  }

  private findDefaultVpc() {
    return new aws.ec2.DefaultVpc("default-vpc", {
      assignGeneratedIpv6CidrBlock: true,
      ipv6CidrBlockNetworkBorderGroup: this.getCurrentRegion(),
      tags: {
        Name: "Default VPC",
      },
    });
  }
}
