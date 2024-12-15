import AwsConfig from "../../../util/AwsConfig";
import { DefaultSubnet, DefaultVpc, Subnet } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import SubnetCidrBlockCalculator from "../../../util/SubnetCidrBlockCalculator";

type SubnetGetCidrBlockParams = {
  ipv4CidrBlock: string;
  ipv4CidrNextCount: number;
};

type SubnetCidrBlockMap = {
  cidrBlock: string;
};

export default class SubnetInfo extends AwsConfig {
  private static readonly IPV4_CIDR_MASK = 20;

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

  public getRdsSubnetGroupIds() {
    return this.getPrivateSubnetIds().then((ids) => ids.slice(0, 2));
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
      .all([this.privateSubnets, defaultVpc.cidrBlock])
      .apply(([defaultSubnets, ipv4CidrBlock]) => {
        const defaultSubnetSize = defaultSubnets.length;

        return Array.from({ length: 2 }).map((_, index) => {
          const cidrBlockMap = this.getCidrBlockMap({
            ipv4CidrBlock: ipv4CidrBlock,
            ipv4CidrNextCount: defaultSubnetSize + index,
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

    return {
      cidrBlock: nextIpv4CidrBlock,
    };
  }
}
