import DistributionInfo from "./default/DistributionInfo";
import { AppEnv } from "../../../util/enums";

export default class CloudFrontInfo {
  public readonly distributionInfo: DistributionInfo;

  constructor(appEnv: AppEnv, httpPort: number) {
    this.distributionInfo = new DistributionInfo(appEnv, httpPort);
  }
}
