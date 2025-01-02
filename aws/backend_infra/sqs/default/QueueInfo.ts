import * as aws from "@pulumi/aws";
import { Queue } from "@pulumi/aws/sqs";
import AwsConfig from "../../../util/AwsConfig";

export default class QueueInfo extends AwsConfig {
  private readonly backendDeliveryRequestScaleDownQueue: Queue;

  constructor() {
    super();

    this.backendDeliveryRequestScaleDownQueue =
      this.createBackendDeliveryRequestScaleDownQueue();
  }

  public getBackendDeliveryRequestScaleDownQueueArn() {
    return this.backendDeliveryRequestScaleDownQueue.arn;
  }

  public getBackendDeliveryRequestScaleDownQueueUrl() {
    return this.backendDeliveryRequestScaleDownQueue.url;
  }

  private createBackendDeliveryRequestScaleDownQueue() {
    const name = this.getBackendDeliveryRequestScaleDownQueueName();
    return new aws.sqs.Queue(name, {
      name,
      visibilityTimeoutSeconds: 10 * 60,
    });
  }
}
