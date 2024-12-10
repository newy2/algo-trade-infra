import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import ParameterStoreInfo from "./application_management/ParameterStoreInfo";

export default class SsmInfo {
  constructor(cloudFrontInfo: CloudFrontInfo) {
    new ParameterStoreInfo(cloudFrontInfo);
  }
}
