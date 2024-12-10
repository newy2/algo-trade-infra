import DistributionInfo from "./default/DistributionInfo";

export default class CloudFrontInfo {
  private readonly distributionInfo: DistributionInfo;

  constructor() {
    this.distributionInfo = new DistributionInfo();
  }

  public getBackendDistributionId() {
    return this.distributionInfo.getBackendDistributionId();
  }

  public getBackendDistributionDomainName() {
    return this.distributionInfo.getBackendDistributionDomainName();
  }
}
