import FunctionInfo from "./default/FunctionInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";
import IamInfo from "../../common_infra/iam/IamInfo";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(iamInfo: IamInfo, commonLambdaInfo: CommonLambdaInfo) {
    this.functionInfo = new FunctionInfo(iamInfo, commonLambdaInfo.layerInfo);
  }
}
