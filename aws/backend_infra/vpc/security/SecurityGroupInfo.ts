import { ProtocolType } from "@pulumi/aws/types/enums/ec2";
import { DefaultVpc, SecurityGroup } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { ALLOW_ALL_ACCESS } from "../../../../util/consts";

type SecurityGroupCidrBlockMap = {
  cidrBlocks: string[];
};

export default class SecurityGroupInfo {
  private readonly defaultVpcId: pulumi.Output<string>;
  private readonly http: SecurityGroup;

  constructor(defaultVpc: DefaultVpc) {
    this.defaultVpcId = defaultVpc.id;
    this.http = this.createHttpSecurityGroup();
  }

  public getHttpSecurityGroupId() {
    return this.http.id;
  }

  private createHttpSecurityGroup() {
    const cidrBlockMap: SecurityGroupCidrBlockMap = {
      cidrBlocks: ["0.0.0.0/0"],
    };

    const port = 8080;
    return new aws.ec2.SecurityGroup("http-security-group", {
      vpcId: this.defaultVpcId,
      ingress: [
        {
          protocol: ProtocolType.TCP,
          fromPort: port,
          toPort: port,
          description: "HTTP",
          ...cidrBlockMap,
        },
      ],
      egress: [ALLOW_ALL_ACCESS],
      tags: {
        Name: "HTTP Security Group",
      },
    });
  }
}
