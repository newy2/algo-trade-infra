import VpcInfo from "../../../common_infra/vpc/VpcInfo";
import { SubnetGroup } from "@pulumi/aws/rds";
import * as aws from "@pulumi/aws";

export default class SubnetGroupInfo {
  private readonly subnetGroup: SubnetGroup;

  constructor(vpcInfo: VpcInfo) {
    this.subnetGroup = this.createSubnetGroup(vpcInfo);
  }

  public getSubnetGroupName() {
    return this.subnetGroup.name;
  }

  private createSubnetGroup(defaultVpcInfo: VpcInfo) {
    return new aws.rds.SubnetGroup("rds-subnet-group", {
      subnetIds: defaultVpcInfo.subnetInfo.getRdsSubnetGroupIds(),
      description: "RDS Subnet Group",
    });
  }
}
