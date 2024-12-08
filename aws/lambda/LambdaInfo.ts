import FunctionInfo from "./default/FunctionInfo";
import { IamInfo } from "../iam/IamInfo";
import SqsInfo from "../sqs/SqsInfo";
import S3Info from "../s3/S3Info";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import LayerInfo from "./additional_resource/LayerInfo";

export default class LambdaInfo {
  private readonly layerInfo: LayerInfo;
  private readonly functionInfo: FunctionInfo;

  constructor(
    iamInfo: IamInfo,
    sqsInfo: SqsInfo,
    s3Info: S3Info,
    cloudfrontInfo: CloudFrontInfo,
  ) {
    this.layerInfo = new LayerInfo();
    this.functionInfo = new FunctionInfo(
      iamInfo,
      sqsInfo,
      cloudfrontInfo,
      this.layerInfo,
    );
    s3Info.setFrontendBucketNotification(this); // TODO Refector (functionInfo 를 직접 전달할까?)
  }

  public getEcrImageCleanupFunctionArn() {
    return this.functionInfo.getCleanupEcrImageFunctionArn();
  }

  public getFrontendDeliveryFunctionArn() {
    return this.functionInfo.getFrontendDeliveryFunctionArn();
  }

  public getBackendDeliveryInitFunctionArn() {
    return this.functionInfo.getBackendDeliveryInitFunctionArn();
  }

  public getBackendDeliveryProcessingFunctionArn() {
    return this.functionInfo.getBackendDeliveryProcessingFunctionArn();
  }
}
