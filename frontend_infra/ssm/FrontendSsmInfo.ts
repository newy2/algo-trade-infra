import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import FrontendParameterStoreInfo from "./application_management/FrontendParameterStoreInfo";

export default class FrontendSsmInfo {
  private readonly frontendParameterStoreInfo: FrontendParameterStoreInfo;

  constructor(frontendCloudFrontInfo: CloudFrontInfo) {
    this.frontendParameterStoreInfo = new FrontendParameterStoreInfo(
      frontendCloudFrontInfo,
    );
  }
}
