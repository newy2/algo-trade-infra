import {
  getAvailabilityZones,
  GetAvailabilityZonesResult,
} from "@pulumi/aws/getAvailabilityZones";
import * as pulumi from "@pulumi/pulumi";
import { Config } from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export default class BaseAwsInfo {
  private readonly config: Config;
  private readonly availabilityZones: Promise<GetAvailabilityZonesResult>;

  constructor() {
    this.config = new pulumi.Config();
    this.availabilityZones = getAvailabilityZones();
  }

  protected getFirstAvailabilityZoneName() {
    return this.getAvailabilityZoneNames().then((it) => it[0]);
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

  protected getEcrPrivateRepositoryName() {
    return "backend-server-repository";
  }

  protected getFrontendBucketName() {
    return "front-algo-trade";
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

  protected isFastCleanupEcrImage() {
    return true;
  }

  protected getRdsUsername() {
    return this.config.require("rds_username");
  }

  protected getRdsPassword() {
    return this.config.requireSecret("rds_password");
  }

  protected getCodeDeliveryStateSnsTopicName() {
    return "code-delivery-state-topic";
  }

  protected getSlackUrl() {
    return this.config.requireSecret("slack_url");
  }
}
