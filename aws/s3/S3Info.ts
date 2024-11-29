import BucketInfo from "./default/BucketInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class S3Info {
  private readonly bucketInfo: BucketInfo;

  constructor() {
    this.bucketInfo = new BucketInfo();
  }

  public getBucketRegionalDomainName() {
    return this.bucketInfo.getBucketRegionalDomainName();
  }

  public setBucketNotification(lambdaInfo: LambdaInfo) {
    this.bucketInfo.setBucketNotification(lambdaInfo);
  }

  public setBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    this.bucketInfo.setBucketPolicy(cloudFrontInfo);
  }
}
