import { ProtocolType } from "@pulumi/aws/types/enums/ec2";
import { ec2 } from "@pulumi/aws/types/input";
import { Input } from "@pulumi/pulumi";
import SecurityGroupEgress = ec2.SecurityGroupEgress;

export const ALLOW_ALL_ACCESS: Input<SecurityGroupEgress> = {
  protocol: ProtocolType.All,
  fromPort: 0,
  toPort: 0,
  cidrBlocks: ["0.0.0.0/0"],
} as const;
