import BucketInfo from "./default/BucketInfo";
import FrontendCloudFrontInfo from "../cloudfront/FrontendCloudFrontInfo";
import FrontendLambdaInfo from "../lambda/FrontendLambdaInfo";

export default class S3Info {
  private readonly bucketInfo: BucketInfo;

  constructor() {
    this.bucketInfo = new BucketInfo();
  }

  public getFrontendBucketRegionalDomainName() {
    return this.bucketInfo.getFrontendBucketRegionalDomainName();
  }

  public setFrontendBucketNotification(frontendLambdaInfo: FrontendLambdaInfo) {
    this.bucketInfo.setFrontendBucketNotification(frontendLambdaInfo);
  }

  public setFrontendBucketPolicy(cloudFrontInfo: FrontendCloudFrontInfo) {
    this.bucketInfo.setFrontendBucketPolicy(cloudFrontInfo);
  }
}