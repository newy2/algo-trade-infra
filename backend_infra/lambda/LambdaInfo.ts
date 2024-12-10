import FunctionInfo from "./default/FunctionInfo";
import IamInfo from "../iam/IamInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(iamInfo: IamInfo, commonLambdaInfo: CommonLambdaInfo) {
    this.functionInfo = new FunctionInfo(iamInfo, commonLambdaInfo.layerInfo);
  }
}
