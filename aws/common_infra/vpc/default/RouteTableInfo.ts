import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { DefaultRouteTable, DefaultVpc, RouteTable } from "@pulumi/aws/ec2";
import { ec2 } from "@pulumi/aws/types/input";
import InternetGatewayInfo from "./InternetGatewayInfo";
import SubnetInfo from "./SubnetInfo";
import DefaultRouteTableRoute = ec2.DefaultRouteTableRoute;

export default class RouteTableInfo {
  private readonly privateRouteTable: DefaultRouteTable;
  private readonly publicRouteTable: RouteTable;

  constructor(
    defaultVpc: DefaultVpc,
    internetGatewayInfo: InternetGatewayInfo,
    subnetInfo: SubnetInfo,
  ) {
    this.privateRouteTable = this.findDefaultRouteTable(defaultVpc);
    this.publicRouteTable = this.createPublicRouteTable(
      defaultVpc,
      internetGatewayInfo,
    );

    this.registerSubnetToRouteTable(subnetInfo);
  }

  private findDefaultRouteTable(defaultVpc: DefaultVpc) {
    const removedRoutes: DefaultRouteTableRoute[] = [];

    return new aws.ec2.DefaultRouteTable("default-route-table", {
      defaultRouteTableId: defaultVpc.defaultRouteTableId,
      routes: removedRoutes,
      tags: {
        Name: "Private Route Table",
      },
    });
  }

  private createPublicRouteTable(
    defaultVpc: DefaultVpc,
    internetGatewayInfo: InternetGatewayInfo,
  ) {
    return new aws.ec2.RouteTable("public-route-table", {
      vpcId: defaultVpc.id,
      routes: [
        {
          cidrBlock: "0.0.0.0/0",
          gatewayId: internetGatewayInfo.getInternetGatewayId(),
        },
      ],
      tags: {
        Name: "Public Route Table",
      },
    });
  }

  private registerSubnetToRouteTable(subnetInfo: SubnetInfo) {
    subnetInfo.getPrivateSubnetIds().then((subnetIds) => {
      subnetIds.forEach((eachSubnetId, index) =>
        this.createAssociation(this.privateRouteTable.id, eachSubnetId, index),
      );
    });

    subnetInfo.getPublicSubnetIds().apply((subnetIds) => {
      subnetIds.forEach((eachSubnetId, index) =>
        this.createAssociation(this.publicRouteTable.id, eachSubnetId, index),
      );
    });
  }

  private createAssociation(
    routeTableId: pulumi.Output<string>,
    subnetId: pulumi.Output<string>,
    index: number,
  ) {
    const prefix =
      routeTableId === this.privateRouteTable.id ? "private" : "public";
    const suffix = index + 1;

    const resourceId = `${prefix}-route-table-association-${suffix}`;
    new aws.ec2.RouteTableAssociation(resourceId, {
      subnetId,
      routeTableId,
    });
  }
}
