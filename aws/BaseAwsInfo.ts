import {
  getAvailabilityZones,
  GetAvailabilityZonesResult,
} from "@pulumi/aws/getAvailabilityZones";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export default class BaseAwsInfo {
  private readonly availabilityZones: Promise<GetAvailabilityZonesResult>;

  constructor() {
    this.availabilityZones = getAvailabilityZones();
  }

  protected getAvailabilityZoneNames() {
    return this.availabilityZones.then((it) => it.names);
  }

  protected getCurrentRegion() {
    return aws.config.region;
  }

  protected getAccountId() {
    return aws.getCallerIdentity().then((it) => it.accountId);
  }

  protected getEc2ServerName() {
    return "algo-trade-server";
  }

  protected createNameTag(
    name: string,
    args: { resourceId: pulumi.Input<string>; value: string },
  ) {
    return new aws.ec2.Tag(name, {
      resourceId: args.resourceId,
      key: "Name",
      value: args.value,
    });
  }

  protected isEnableIpv6() {
    return true;
  }
}
