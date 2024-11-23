import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import EcrInfo from "../ecr/EcrInfo";
import { RdsInfo } from "../rds/RdsInfo";
import VpcInfo from "../vpc/VpcInfo";

export default class SsmInfo {
  private readonly parameterStoreInfo: ParameterStoreInfo;

  constructor(vpcInfo: VpcInfo, ecrInfo: EcrInfo, rdsInfo: RdsInfo) {
    this.parameterStoreInfo = new ParameterStoreInfo(vpcInfo, ecrInfo, rdsInfo);
  }
}
