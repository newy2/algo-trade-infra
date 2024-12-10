import S3Info from "../s3/S3Info";
import FunctionInfo from "./default/FunctionInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";
import IamInfo from "../iam/IamInfo";

export default class LambdaInfo {
  private readonly frontendFunctionInfo: FunctionInfo;

  constructor(
    iamInfo: IamInfo,
    s3Info: S3Info,
    commonLambdaInfo: CommonLambdaInfo,
  ) {
    this.frontendFunctionInfo = new FunctionInfo(
      iamInfo,
      commonLambdaInfo.layerInfo,
    );
    s3Info.setFrontendBucketNotification(this); // TODO Refector (functionInfo 를 직접 전달할까?)
  }

  public getFrontendDeliveryFunctionArn() {
    return this.frontendFunctionInfo.getFrontendDeliveryFunctionArn();
  }
}
