import * as aws from "@pulumi/aws";
import { Queue } from "@pulumi/aws/sqs";

export default class QueueInfo {
  private readonly frontendRollbackQueue: Queue;

  constructor() {
    this.frontendRollbackQueue = this.createFrontendRollbackQueue();
  }

  public getFrontendRollbackQueueArn() {
    return this.frontendRollbackQueue.arn;
  }

  private createFrontendRollbackQueue() {
    return new aws.sqs.Queue("frontend-rollback-queue", {
      name: "frontend-rollback-queue",
    });
  }
}