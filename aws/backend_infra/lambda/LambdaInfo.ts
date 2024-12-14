import FunctionInfo from "./default/FunctionInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";
import IamInfo from "../../common_infra/iam/IamInfo";
import BackendAppInfra from "../../backend_app_infra/BackendAppInfra";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(
    iamInfo: IamInfo,
    commonLambdaInfo: CommonLambdaInfo,
    backendAppInfraList: BackendAppInfra[],
  ) {
    this.functionInfo = new FunctionInfo(
      iamInfo,
      commonLambdaInfo.layerInfo,
      backendAppInfraList,
    );
  }
}
