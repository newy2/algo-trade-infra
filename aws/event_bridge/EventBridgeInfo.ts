import RuleInfo from "./bus/RuleInfo";
import EcrInfo from "../ecr/EcrInfo";
import { IamInfo } from "../iam/IamInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class EventBridgeInfo {
  private readonly ruleInfo: RuleInfo;

  constructor(ecrInfo: EcrInfo, iamInfo: IamInfo, lambdaInfo: LambdaInfo) {
    this.ruleInfo = new RuleInfo(ecrInfo, iamInfo, lambdaInfo);
  }
}
