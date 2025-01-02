import RuleInfo from "./bus/RuleInfo";
import LambdaInfo from "../lambda/LambdaInfo";
import BackendAppInfra from "../../backend_app_infra/BackendAppInfra";

export default class EventBridgeInfo {
  constructor(backendAppInfraList: BackendAppInfra[], lambdaInfo: LambdaInfo) {
    new RuleInfo(backendAppInfraList, lambdaInfo);
  }
}
