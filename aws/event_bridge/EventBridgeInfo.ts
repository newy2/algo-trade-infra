import RuleInfo from "./bus/RuleInfo";
import EcrInfo from "../ecr/EcrInfo";
import { IamInfo } from "../iam/IamInfo";

export default class EventBridgeInfo {
  private readonly ruleInfo: RuleInfo;

  constructor(ecrInfo: EcrInfo, iamInfo: IamInfo) {
    this.ruleInfo = new RuleInfo(ecrInfo, iamInfo);
  }
}
