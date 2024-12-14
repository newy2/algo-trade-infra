import { ProtocolType } from "@pulumi/aws/types/enums/ec2";
import { SecurityGroup } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import { ALLOW_ALL_ACCESS } from "../../../../util/consts";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";
import CommonInfra from "../../../common_infra/CommonInfra";

type SecurityGroupCidrBlockMap = {
  cidrBlocks: string[];
};

export default class SecurityGroupInfo {
  private readonly http: SecurityGroup;

  constructor(appEnv: AppEnv, httpPort: number, commonInfra: CommonInfra) {
    this.http = this.createHttpSecurityGroup(appEnv, httpPort, commonInfra);
  }

  public getHttpSecurityGroupId() {
    return this.http.id;
  }

  private createHttpSecurityGroup(
    appEnv: AppEnv,
    httpPort: number,
    commonInfra: CommonInfra,
  ) {
    const cidrBlockMap: SecurityGroupCidrBlockMap = {
      cidrBlocks: ["0.0.0.0/0"],
    };

    const port = httpPort;
    return new aws.ec2.SecurityGroup(genName(appEnv, "http-security-group"), {
      vpcId: commonInfra.vpcInfo.defaultVpc.id,
      ingress: [
        {
          protocol: ProtocolType.TCP,
          fromPort: port,
          toPort: port,
          description: `[${appEnv}] HTTP`,
          ...cidrBlockMap,
        },
      ],
      egress: [ALLOW_ALL_ACCESS],
      tags: {
        Name: `[${appEnv}] HTTP Security Group`,
      },
    });
  }
}
