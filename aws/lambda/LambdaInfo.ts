import FunctionInfo from "./default/FunctionInfo";
import { IamInfo } from "../iam/IamInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";

export default class LambdaInfo {
  private readonly functionInfo: FunctionInfo;

  constructor(iamInfo: IamInfo, commonLambdaInfo: CommonLambdaInfo) {
    this.functionInfo = new FunctionInfo(iamInfo, commonLambdaInfo.layerInfo);
  }

  public getEcrImageCleanupFunctionArn() {
    return this.functionInfo.getCleanupEcrImageFunctionArn();
  }

  public getBackendDeliveryEventSourceMapperFunctionArn() {
    return this.functionInfo.getBackendDeliveryEventSourceMapperFunctionArn();
  }

  public getBackendDeliveryInitFunctionArn() {
    return this.functionInfo.getBackendDeliveryInitFunctionArn();
  }

  public getBackendDeliveryProcessingFunctionArn() {
    return this.functionInfo.getBackendDeliveryProcessingFunctionArn();
  }
}
