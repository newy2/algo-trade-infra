import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import EcrInfo from "../ecr/EcrInfo";

export default class SsmInfo {
  private readonly parameterStoreInfo: ParameterStoreInfo;

  constructor(ecrInfo: EcrInfo) {
    this.parameterStoreInfo = new ParameterStoreInfo(ecrInfo);
  }
}
