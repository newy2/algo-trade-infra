import FunctionInfo from "./default/FunctionInfo";
import { IamInfo } from "../iam/IamInfo";
import SqsInfo from "../sqs/SqsInfo";

export default class LambdaInfo {
  private readonly functionInfo: FunctionInfo;

  constructor(iamInfo: IamInfo, sqsInfo: SqsInfo) {
    this.functionInfo = new FunctionInfo(iamInfo, sqsInfo);
  }

  public getEcrImageCleanupFunctionArn() {
    return this.functionInfo.getCleanupEcrImageFunctionArn();
  }

  public getFrontendDeliveryFunctionArn() {
    return this.functionInfo.getFrontendDeliveryFunctionArn();
  }
}