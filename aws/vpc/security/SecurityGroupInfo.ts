import { ProtocolType } from "@pulumi/aws/types/enums/ec2";
import { DefaultVpc, SecurityGroup } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import BaseAwsInfo from "../../BaseAwsInfo";

type SecurityGroupCidrBlockMap = {
  cidrBlocks: string[];
  ipv6CidrBlocks?: string[];
};

export default class SecurityGroupInfo extends BaseAwsInfo {
  private static ALLOW_ALL_ACCESS = {
    protocol: ProtocolType.All,
    fromPort: 0,
    toPort: 0,
    cidrBlocks: ["0.0.0.0/0"],
  };

  private readonly defaultVpcId: pulumi.Output<string>;
  private readonly ssh: SecurityGroup;
  private readonly https: SecurityGroup;
  private readonly rdsClient: SecurityGroup;
  private readonly rdsServer: SecurityGroup;
  private readonly eice: SecurityGroup;

  constructor(defaultVpc: DefaultVpc) {
    super();

    this.defaultVpcId = defaultVpc.id;
    this.ssh = this.createSshSecurityGroup();
    this.https = this.createHttpsSecurityGroup();
    this.rdsClient = this.createRdsClientSecurityGroup();
    this.rdsServer = this.createRdsServerSecurityGroup(this.rdsClient);
    this.eice = this.createEiceSecurityGroup();

    this.changeDefaultSecurityGroupName(defaultVpc);
  }

  public getRdsSecurityGroupIds() {
    return [this.eice.id, this.rdsClient.id];
  }

  public getEc2SecurityGroupIds() {
    return [this.ssh.id, this.https.id, this.rdsClient.id];
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
      egress: [SecurityGroupInfo.ALLOW_ALL_ACCESS],
      tags: {
        Name: "SSH Security Group",
      },
    });
  }

  private createHttpsSecurityGroup() {
    const cidrBlockMap: SecurityGroupCidrBlockMap = {
      cidrBlocks: ["0.0.0.0/0"],
      ipv6CidrBlocks: this.isEnableIpv6() ? ["::/0"] : undefined,
    };

    return new aws.ec2.SecurityGroup("https-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [
        {
          protocol: ProtocolType.TCP,
          fromPort: 80,
          toPort: 80,
          description: "HTTP",
          ...cidrBlockMap,
        },
        {
          protocol: ProtocolType.TCP,
          fromPort: 443,
          toPort: 443,
          description: "HTTPS",
          ...cidrBlockMap,
        },
      ],
      egress: [SecurityGroupInfo.ALLOW_ALL_ACCESS],
      tags: {
        Name: "HTTPS Security Group",
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
      egress: [SecurityGroupInfo.ALLOW_ALL_ACCESS],
      tags: {
        Name: "RDS Server Security Group",
      },
    });
  }

  private createEiceSecurityGroup() {
    return new aws.ec2.SecurityGroup("eice-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [SecurityGroupInfo.ALLOW_ALL_ACCESS],
      egress: [SecurityGroupInfo.ALLOW_ALL_ACCESS],
      tags: {
        Name: "EICE Security Group (for connect to RDS)",
      },
    });
  }

  private changeDefaultSecurityGroupName(defaultVpc: DefaultVpc) {
    this.createNameTag("default-security-group-name", {
      resourceId: defaultVpc.defaultSecurityGroupId,
      value: "NOT USED",
    });
  }
}
