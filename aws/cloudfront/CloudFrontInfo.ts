import OriginAccessInfo from "./security/OriginAccessInfo";
import S3Info from "../s3/S3Info";
import DistributionInfo from "./default/DistributionInfo";
import FunctionInfo from "./default/FunctionInfo";

export default class CloudFrontInfo {
  private readonly functionInfo: FunctionInfo;
  private readonly originAccessInfo: OriginAccessInfo;
  private readonly distributionInfo: DistributionInfo;

  constructor(s3Info: S3Info) {
    this.functionInfo = new FunctionInfo();
    this.originAccessInfo = new OriginAccessInfo(s3Info);
    this.distributionInfo = new DistributionInfo(
      s3Info,
      this.functionInfo,
      this.originAccessInfo,
    );
    s3Info.setBucketPolicy(this);
  }

  public getDistributionArn() {
    return this.distributionInfo.getDistributionArn();
  }
}
