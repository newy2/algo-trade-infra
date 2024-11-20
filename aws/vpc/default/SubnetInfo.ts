import BaseAwsInfo from "../../BaseAwsInfo";
import { DefaultSubnet, DefaultVpc, Subnet } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import SubnetCidrBlockCalculator from "../../../util/SubnetCidrBlockCalculator";

type SubnetGetCidrBlockParams = {
  ipv4CidrBlock: string;
  ipv4CidrNextCount: number;
  ipv6CidrBlock: string;
  ipv6CidrNextCount: number;
};

type SubnetCidrBlockMap = {
  cidrBlock: string;
  assignIpv6AddressOnCreation?: boolean;
  ipv6CidrBlock?: string;
};

export default class SubnetInfo extends BaseAwsInfo {
  private static readonly IPV4_CIDR_MASK = 20;
  private static readonly IPV6_CIDR_MASK = 64;

  private readonly privateSubnets: Promise<DefaultSubnet[]>;
  private readonly publicSubnets: pulumi.Output<Subnet[]>;

  constructor(defaultVpc: DefaultVpc) {
    super();

    this.privateSubnets = this.findDefaultSubnets();
    this.publicSubnets = this.createPublicSubnet(defaultVpc);
  }

  public getPrivateSubnetIds() {
    return this.privateSubnets.then((subnets) =>
      subnets.map((each) => each.id),
    );
  }

  public getPublicSubnetIds() {
    return this.publicSubnets.apply((publicSubnets) =>
      publicSubnets.map((each) => each.id),
    );
  }

  public getFirstPrivateSubnetId() {
    return this.getPrivateSubnetIds().then(
      (ids) => ids[0],
    ) as pulumi.Input<string>;
  }

  public getFirstPublicSubnetId() {
    return this.getPublicSubnetIds().apply(
      (ids) => ids[0],
    ) as pulumi.Input<string>;
  }

  private findDefaultSubnets() {
    return this.getAvailabilityZoneNames().then((names) =>
      names.map((eachName, index) => {
        const subnetSeq = index + 1;
        return new aws.ec2.DefaultSubnet(`default-subnet-${subnetSeq}`, {
          availabilityZone: eachName,
          tags: {
            Name: `Private Subnet ${subnetSeq}`,
          },
        });
      }),
    );
  }

  private createPublicSubnet(defaultVpc: DefaultVpc) {
    return pulumi
      .all([
        this.privateSubnets,
        defaultVpc.cidrBlock,
        defaultVpc.ipv6CidrBlock,
      ])
      .apply(([defaultSubnets, ipv4CidrBlock, ipv6CidrBlock]) => {
        const defaultSubnetSize = defaultSubnets.length;

        return Array.from({ length: 2 }).map((_, index) => {
          const cidrBlockMap = this.getCidrBlockMap({
            ipv4CidrBlock: ipv4CidrBlock,
            ipv4CidrNextCount: defaultSubnetSize + index,
            ipv6CidrBlock: ipv6CidrBlock,
            ipv6CidrNextCount: index,
          });

          const subnetSeq = index + 1;
          return new aws.ec2.Subnet(`public-subnet-${subnetSeq}`, {
            ...cidrBlockMap,
            vpcId: defaultVpc.id,
            mapPublicIpOnLaunch: true,
            availabilityZone: this.getAvailabilityZoneNames().then(
              (each) => each[index],
            ),
            tags: {
              Name: `Public Subnet ${subnetSeq}`,
            },
          });
        });
      });
  }

  private getCidrBlockMap(
    params: SubnetGetCidrBlockParams,
  ): SubnetCidrBlockMap {
    const nextIpv4CidrBlock = new SubnetCidrBlockCalculator(
      params.ipv4CidrBlock,
      SubnetInfo.IPV4_CIDR_MASK,
    ).nextCidrBlock(params.ipv4CidrNextCount);

    if (!this.isEnableIpv6()) {
      return {
        cidrBlock: nextIpv4CidrBlock,
      };
    }

    return {
      cidrBlock: nextIpv4CidrBlock,
      assignIpv6AddressOnCreation: true,
      ipv6CidrBlock: new SubnetCidrBlockCalculator(
        params.ipv6CidrBlock,
        SubnetInfo.IPV6_CIDR_MASK,
      ).nextCidrBlock(params.ipv6CidrNextCount),
    };
  }
}
