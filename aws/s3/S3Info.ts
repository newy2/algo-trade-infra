import BucketInfo from "./default/BucketInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";

export default class S3Info {
  private readonly bucketInfo: BucketInfo;

  constructor() {
    this.bucketInfo = new BucketInfo();
  }

  public getBucketRegionalDomainName() {
    return this.bucketInfo.getBucketRegionalDomainName();
  }

  public setBucketPolicy(cloudFrontInfo: CloudFrontInfo) {
    this.bucketInfo.setBucketPolicy(cloudFrontInfo);
  }
}
