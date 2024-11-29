import FunctionInfo from "./default/FunctionInfo";
import { IamInfo } from "../iam/IamInfo";

export default class LambdaInfo {
  private readonly functionInfo: FunctionInfo;

  constructor(iamInfo: IamInfo) {
    this.functionInfo = new FunctionInfo(iamInfo);
  }

  public getEcrImageCleanupFunctionArn() {
    return this.functionInfo.getCleanupEcrImageFunctionArn();
  }

  public getFrontendDeployFunctionArn() {
    return this.functionInfo.getFrontendDeployFunctionArn();
  }
}