import TopicInfo from "./default/TopicInfo";
import SubscriptionInfo from "./default/SubscriptionInfo";
import FrontendLambdaInfo from "../lambda/FrontendLambdaInfo";

export default class SnsInfo {
  private readonly topicInfo: TopicInfo;
  private readonly subscriptionInfo: SubscriptionInfo;

  constructor(frontendLambdaInfo: FrontendLambdaInfo) {
    this.topicInfo = new TopicInfo();
    this.subscriptionInfo = new SubscriptionInfo(
      this.topicInfo,
      frontendLambdaInfo,
    );
  }
}
