import { SubnetGroup } from "@pulumi/aws/rds";
import * as aws from "@pulumi/aws";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class SubnetGroupInfo {
  private readonly subnetGroup: SubnetGroup;

  constructor(commonInfra: CommonInfra) {
    this.subnetGroup = this.createSubnetGroup(commonInfra);
  }

  public getSubnetGroupName() {
    return this.subnetGroup.name;
  }

  private createSubnetGroup(commonInfra: CommonInfra) {
    return new aws.rds.SubnetGroup("rds-subnet-group", {
      subnetIds: commonInfra.vpcInfo.subnetInfo.getRdsSubnetGroupIds(),
      description: "RDS Subnet Group",
    });
  }
}
