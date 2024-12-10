import * as aws from "@pulumi/aws";
import { Instance } from "@pulumi/aws/rds";
import VpcInfo from "../../vpc/VpcInfo";
import SubnetGroupInfo from "./SubnetGroupInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class InstanceInfo extends BaseAwsInfo {
  private static FREE_TIER_OPTION = {
    instanceClass: aws.rds.InstanceType.T4G_Micro,
    storageType: aws.rds.StorageType.GP2,
    storageEncrypted: true,
    allocatedStorage: 20,
    backupRetentionPeriod: 7,
    skipFinalSnapshot: true,
    performanceInsightsEnabled: true,
    performanceInsightsRetentionPeriod: 7,
    multiAz: false,
  };
  private static readonly PORT = 3389;

  private readonly instance: Instance;

  constructor(vpcInfo: VpcInfo, subnetGroupInfo: SubnetGroupInfo) {
    super();

    this.instance = this.createRdsInstance(vpcInfo, subnetGroupInfo);
  }

  public getEndpoint() {
    return this.instance.endpoint; // with port
  }

  public getAddress() {
    return this.instance.address; // without port
  }

  public getUsername() {
    return this.instance.username;
  }

  public getPassword() {
    return this.instance.password;
  }

  private createRdsInstance(
    vpcInfo: VpcInfo,
    subnetGroupInfo: SubnetGroupInfo,
  ) {
    return new aws.rds.Instance("default-rds", {
      ...InstanceInfo.FREE_TIER_OPTION,
      engine: "postgres",
      engineVersion: "16.3",
      parameterGroupName: "default.postgres16",
      port: InstanceInfo.PORT,
      username: this.getRdsUsername(),
      password: this.getRdsPassword(),
      availabilityZone: this.getFirstAvailabilityZoneName(),
      dbSubnetGroupName: subnetGroupInfo.getSubnetGroupName(),
      vpcSecurityGroupIds: vpcInfo.securityGroupInfo.getRdsSecurityGroupIds(),
    });
  }
}
