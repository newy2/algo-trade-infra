import OriginAccessInfo from "./security/OriginAccessInfo";
import S3Info from "../s3/S3Info";
import FrontendDistributionInfo from "./default/FrontendDistributionInfo";
import FunctionInfo from "./default/FunctionInfo";

export default class FrontendCloudFrontInfo {
  private readonly functionInfo: FunctionInfo;
  private readonly originAccessInfo: OriginAccessInfo;
  private readonly distributionInfo: FrontendDistributionInfo;

  constructor(s3Info: S3Info) {
    this.functionInfo = new FunctionInfo();
    this.originAccessInfo = new OriginAccessInfo(s3Info);
    this.distributionInfo = new FrontendDistributionInfo(
      s3Info,
      this.functionInfo,
      this.originAccessInfo,
    );
    s3Info.setFrontendBucketPolicy(this);
  }

  public getFrontendDistributionArn() {
    return this.distributionInfo.getFrontendDistributionArn();
  }

  public getFrontendDistributionDomainName() {
    return this.distributionInfo.getFrontendDistributionDomainName();
  }

  public getFrontendDistributionId() {
    return this.distributionInfo.getFrontendDistributionId();
  }
}
