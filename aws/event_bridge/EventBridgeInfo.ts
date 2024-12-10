import RuleInfo from "./bus/RuleInfo";
import EcrInfo from "../ecr/EcrInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class EventBridgeInfo {
  constructor(ecrInfo: EcrInfo, lambdaInfo: LambdaInfo) {
    new RuleInfo(ecrInfo, lambdaInfo);
  }
}
