import TopicInfo from "./default/TopicInfo";
import SubscriptionInfo from "./default/SubscriptionInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class SnsInfo {
  constructor(lambdaInfo: LambdaInfo) {
    const topicInfo = new TopicInfo();
    new SubscriptionInfo(topicInfo, lambdaInfo);
  }
}
