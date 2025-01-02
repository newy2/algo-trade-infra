import { ProtocolType } from "@pulumi/aws/types/enums/ec2";
import { DefaultVpc, SecurityGroup } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import AwsConfig from "../../../util/AwsConfig";
import { ALLOW_ALL_ACCESS } from "../../../util/consts";
import { createNameTag } from "../../../util/utils";

export default class SecurityGroupInfo extends AwsConfig {
  private readonly defaultVpcId: pulumi.Output<string>;
  private readonly ssh: SecurityGroup;
  private readonly rdsClient: SecurityGroup;
  private readonly rdsServer: SecurityGroup;
  private readonly eice: SecurityGroup;

  constructor(defaultVpc: DefaultVpc) {
    super();

    this.defaultVpcId = defaultVpc.id;
    this.ssh = this.createSshSecurityGroup();
    this.rdsClient = this.createRdsClientSecurityGroup();
    this.rdsServer = this.createRdsServerSecurityGroup(this.rdsClient);
    this.eice = this.createEiceSecurityGroup();

    this.changeDefaultSecurityGroupName(defaultVpc);
  }

  public getRdsSecurityGroupIds() {
    return [this.rdsServer.id];
  }

  public getEiceSecurityGroupIds() {
    return [this.eice.id, this.rdsClient.id];
  }

  public getEc2SecurityGroupIds() {
    return [this.ssh.id, this.rdsClient.id];
  }

  private createSshSecurityGroup() {
    const ec2InstanceConnectIp = aws.ec2.getManagedPrefixList({
      name: `com.amazonaws.${this.getCurrentRegion()}.ec2-instance-connect`,
    });

    return new aws.ec2.SecurityGroup("ssh-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [
        {
          protocol: ProtocolType.TCP,
          fromPort: 22,
          toPort: 22,
          prefixListIds: [ec2InstanceConnectIp.then((it) => it.id)],
          description: "SSH",
        },
      ],
      egress: [ALLOW_ALL_ACCESS],
      tags: {
        Name: "SSH Security Group",
      },
    });
  }

  private createRdsClientSecurityGroup() {
    return new aws.ec2.SecurityGroup("rds-client-security-group", {
      vpcId: this.defaultVpcId,
      tags: {
        Name: "RDS Client Security Group",
      },
    });
  }

  private createRdsServerSecurityGroup(rdsClientSecurityGroup: SecurityGroup) {
    return new aws.ec2.SecurityGroup("rds-server-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [
        {
          protocol: ProtocolType.All,
          fromPort: 0,
          toPort: 0,
          securityGroups: [rdsClientSecurityGroup.id],
        },
      ],
      egress: [ALLOW_ALL_ACCESS],
      tags: {
        Name: "RDS Server Security Group",
      },
    });
  }

  private createEiceSecurityGroup() {
    return new aws.ec2.SecurityGroup("eice-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [ALLOW_ALL_ACCESS],
      egress: [ALLOW_ALL_ACCESS],
      tags: {
        Name: "EICE Security Group (for connect to RDS)",
      },
    });
  }

  private changeDefaultSecurityGroupName(defaultVpc: DefaultVpc) {
    createNameTag("default-security-group-name", {
      resourceId: defaultVpc.defaultSecurityGroupId,
      value: "NOT USED",
    });
  }
}
