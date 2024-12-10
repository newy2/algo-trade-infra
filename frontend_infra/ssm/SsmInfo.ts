import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import ParameterStoreInfo from "./application_management/ParameterStoreInfo";

export default class SsmInfo {
  private readonly parameterStoreInfo: ParameterStoreInfo;

  constructor(cloudFrontInfo: CloudFrontInfo) {
    this.parameterStoreInfo = new ParameterStoreInfo(cloudFrontInfo);
  }
}
