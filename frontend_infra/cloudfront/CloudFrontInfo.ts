import OriginAccessInfo from "./security/OriginAccessInfo";
import S3Info from "../s3/S3Info";
import DistributionInfo from "./default/DistributionInfo";
import FunctionInfo from "./default/FunctionInfo";

export default class CloudFrontInfo {
  public readonly distributionInfo: DistributionInfo;

  constructor(s3Info: S3Info) {
    const functionInfo = new FunctionInfo();
    const originAccessInfo = new OriginAccessInfo(s3Info);
    this.distributionInfo = new DistributionInfo(
      s3Info,
      functionInfo,
      originAccessInfo,
    );
    s3Info.setFrontendBucketPolicy(this);
  }
}
