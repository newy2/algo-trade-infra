import QueueInfo from "./default/QueueInfo";

export default class SqsInfo {
  public readonly queueInfo: QueueInfo;

  constructor() {
    this.queueInfo = new QueueInfo();
  }
}
