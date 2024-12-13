import S3Info from "../s3/S3Info";
import FunctionInfo from "./default/FunctionInfo";
import CommonLambdaInfo from "../../common_infra/lambda/CommonLambdaInfo";
import IamInfo from "../../common_infra/iam/IamInfo";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(
    iamInfo: IamInfo,
    s3Info: S3Info,
    commonLambdaInfo: CommonLambdaInfo,
  ) {
    this.functionInfo = new FunctionInfo(iamInfo, commonLambdaInfo.layerInfo);
    s3Info.bucketInfo.setFrontendBucketNotification(this); // TODO Refector (functionInfo 를 직접 전달할까?)
  }
}
