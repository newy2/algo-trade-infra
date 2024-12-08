import QueueInfo from "./default/QueueInfo";

export default class SqsInfo {
  private readonly queueInfo: QueueInfo;

  constructor() {
    this.queueInfo = new QueueInfo();
  }

  public getFrontendRollbackQueueArn() {
    return this.queueInfo.getFrontendRollbackQueueArn();
  }

  public getBackendDeliveryCompleteQueueArn() {
    return this.queueInfo.getBackendDeliveryCompleteQueueArn();
  }

  public getBackendDeliveryCompleteQueueUrl() {
    return this.queueInfo.getBackendDeliveryCompleteQueueUrl();
  }
}
