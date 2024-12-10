import DistributionInfo from "./default/DistributionInfo";

export default class CloudFrontInfo {
  public readonly distributionInfo: DistributionInfo;

  constructor() {
    this.distributionInfo = new DistributionInfo();
  }
}
