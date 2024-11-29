import BucketInfo from "./default/BucketInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import LambdaInfo from "../lambda/LambdaInfo";

export default class S3Info {
  private readonly bucketInfo: BucketInfo;

  constructor(lambdaInfo: LambdaInfo) {
    this.bucketInfo = new BucketInfo(lambdaInfo);
  }

  public getBucketRegionalDomainName() {
    return this.bucketInfo.getBucketRegionalDomainName();
  }

  public setBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    this.bucketInfo.setBucketPolicy(cloudFrontInfo);
  }
}