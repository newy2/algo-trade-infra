import FunctionInfo from "./default/FunctionInfo";
import BackendAppInfra from "../../backend_app_infra/BackendAppInfra";
import CommonInfra from "../../common_infra/CommonInfra";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    this.functionInfo = new FunctionInfo(backendAppInfraList, commonInfra);
  }
}
