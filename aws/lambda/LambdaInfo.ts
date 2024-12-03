import FunctionInfo from "./default/FunctionInfo";
import { IamInfo } from "../iam/IamInfo";
import SqsInfo from "../sqs/SqsInfo";
import S3Info from "../s3/S3Info";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";

export default class LambdaInfo {
  private readonly functionInfo: FunctionInfo;

  constructor(
    iamInfo: IamInfo,
    sqsInfo: SqsInfo,
    s3Info: S3Info,
    cloudfrontInfo: CloudFrontInfo,
  ) {
    this.functionInfo = new FunctionInfo(iamInfo, sqsInfo, cloudfrontInfo);
    s3Info.setBucketNotification(this); // TODO Refector (functionInfo 를 직접 전달할까?)
  }

  public getEcrImageCleanupFunctionArn() {
    return this.functionInfo.getCleanupEcrImageFunctionArn();
  }

  public getFrontendDeliveryFunctionArn() {
    return this.functionInfo.getFrontendDeliveryFunctionArn();
  }

  public getSendSlackMessageFunctionArn() {
    return this.functionInfo.getSendSlackMessageFunctionArn();
  }

  public getSendSlackMessageFunctionName() {
    return this.functionInfo.getSendSlackMessageFunctionName();
  }
}
