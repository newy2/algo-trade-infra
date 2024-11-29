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

  protected getAccessParameterStoreLambdaLayerArn() {
    // ARN 참고: https://docs.aws.amazon.com/ko_kr/systems-manager/latest/userguide/ps-integration-lambda-extensions.html#intel

    switch (this.getCurrentRegion()) {
      case "ap-northeast-1":
        return "arn:aws:lambda:ap-northeast-1:133490724326:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12";
      case "ap-northeast-2":
        return "arn:aws:lambda:ap-northeast-2:738900069198:layer:AWS-Parameters-and-Secrets-Lambda-Extension:12";
      default:
        throw new Error("Not support region");
    }
  }
}