import VpcInfo from "../vpc/VpcInfo";
import ParameterStoreInfo from "./application_management/ParameterStoreInfo";

export default class SsmInfo {
  constructor(vpcInfo: VpcInfo) {
    new ParameterStoreInfo(vpcInfo);
  }
}
