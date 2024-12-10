import BucketInfo from "./default/BucketInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import LambdaInfo from "../lambda/LambdaInfo";

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

  public setFrontendBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    this.bucketInfo.setFrontendBucketPolicy(cloudFrontInfo);
  }
}
