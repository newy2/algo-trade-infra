import RuleInfo from "./bus/RuleInfo";
import EcrInfo from "../ecr/EcrInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class EventBridgeInfo {
  private readonly ruleInfo: RuleInfo;

  constructor(ecrInfo: EcrInfo, lambdaInfo: LambdaInfo) {
    this.ruleInfo = new RuleInfo(ecrInfo, lambdaInfo);
  }
}
