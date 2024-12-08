import * as aws from "@pulumi/aws";
import { Queue } from "@pulumi/aws/sqs";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class QueueInfo extends BaseAwsInfo {
  private readonly frontendRollbackQueue: Queue;
  private readonly backendDeliveryCompleteQueue: Queue;

  constructor() {
    super();

    this.frontendRollbackQueue = this.createFrontendRollbackQueue();
    this.backendDeliveryCompleteQueue =
      this.createBackendDeliveryCompleteQueue();
  }

  public getFrontendRollbackQueueArn() {
    return this.frontendRollbackQueue.arn;
  }

  public getBackendDeliveryCompleteQueueArn() {
    return this.backendDeliveryCompleteQueue.arn;
  }

  public getBackendDeliveryCompleteQueueUrl() {
    return this.backendDeliveryCompleteQueue.url;
  }

  private createFrontendRollbackQueue() {
    const name = "frontend-rollback-queue";
    return new aws.sqs.Queue(name, {
      name,
    });
  }

  private createBackendDeliveryCompleteQueue() {
    const name = this.getBackendDeliveryCompleteQueueName();
    return new aws.sqs.Queue(name, {
      name,
      visibilityTimeoutSeconds: 5 * 60,
    });
  }
}
