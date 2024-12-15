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

  protected getFrontendBucketName() {
    return "algo-trade-frontend-bucket";
  }

  protected isFastCleanupEcrImage() {
    return true;
  }

  protected isDevMode() {
    return true;
  }

  protected getRdsUsername() {
    return this.config.require("rds_username");
  }

  protected getRdsPassword() {
    return this.config.requireSecret("rds_password");
  }

  protected getSlackUrl() {
    return this.config.requireSecret("slack_url");
  }

  protected getLocalFrontendUrl() {
    return this.config.require("local_frontend_url");
  }

  protected getBackendServerAutoScalingGroupName() {
    return "backend-server-autoscaling-group";
  }

  protected getBackendDeliveryRequestScaleDownQueueName() {
    return "backend-delivery-request-scale-down-queue";
  }

  protected getBackendDeliveryScaleDownLambdaName() {
    return "backend-delivery-scale-down-lambda";
  }

  protected getBackendDeliveryRequestScaleDownQueueMappingLambdaName() {
    return "backend-delivery-request-scale-down-queue-mapping-lambda";
  }

  protected getBackendDeliveryRequestScaleDownQueueArn() {
    return pulumi.interpolate`arn:aws:sqs:${this.getCurrentRegion()}:${this.getAccountId()}:${this.getBackendDeliveryRequestScaleDownQueueName()}`;
  }
}
