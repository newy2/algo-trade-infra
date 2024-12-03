import TopicInfo from "./default/TopicInfo";
import SubscriptionInfo from "./default/SubscriptionInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class SnsInfo {
  private readonly topicInfo: TopicInfo;
  private readonly subscriptionInfo: SubscriptionInfo;

  constructor(lambdaInfo: LambdaInfo) {
    this.topicInfo = new TopicInfo();
    this.subscriptionInfo = new SubscriptionInfo(this.topicInfo, lambdaInfo);
  }
}
