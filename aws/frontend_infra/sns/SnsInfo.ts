import TopicInfo from "./default/TopicInfo";
import SubscriptionInfo from "./default/SubscriptionInfo";
import LambdaInfo from "../lambda/LambdaInfo";
import { AppEnv } from "../../../util/enums";

export default class SnsInfo {
  constructor(appEnv: AppEnv, lambdaInfo: LambdaInfo) {
    const topicInfo = new TopicInfo(appEnv);
    new SubscriptionInfo(appEnv, topicInfo, lambdaInfo);
  }
}
