import * as aws from "@pulumi/aws";
import { Queue } from "@pulumi/aws/sqs";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class QueueInfo extends BaseAwsInfo {
  private readonly backendDeliveryCompleteQueue: Queue;

  constructor() {
    super();

    this.backendDeliveryCompleteQueue =
      this.createBackendDeliveryCompleteQueue();
  }

  public getBackendDeliveryCompleteQueueArn() {
    return this.backendDeliveryCompleteQueue.arn;
  }

  public getBackendDeliveryCompleteQueueUrl() {
    return this.backendDeliveryCompleteQueue.url;
  }

  private createBackendDeliveryCompleteQueue() {
    const name = this.getBackendDeliveryCompleteQueueName();
    return new aws.sqs.Queue(name, {
      name,
      visibilityTimeoutSeconds: 5 * 60,
    });
  }
}
