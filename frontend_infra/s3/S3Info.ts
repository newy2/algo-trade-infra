import BucketInfo from "./default/BucketInfo";
import LambdaInfo from "../../aws/lambda/LambdaInfo";
import FrontendCloudFrontInfo from "../cloudfront/FrontendCloudFrontInfo";

export default class S3Info {
  private readonly bucketInfo: BucketInfo;

  constructor() {
    this.bucketInfo = new BucketInfo();
  }

  public getFrontendBucketRegionalDomainName() {
    return this.bucketInfo.getFrontendBucketRegionalDomainName();
  }

  public setFrontendBucketNotification(lambdaInfo: LambdaInfo) {
    this.bucketInfo.setFrontendBucketNotification(lambdaInfo);
  }

  public setFrontendBucketPolicy(cloudFrontInfo: FrontendCloudFrontInfo) {
    this.bucketInfo.setFrontendBucketPolicy(cloudFrontInfo);
  }
}
