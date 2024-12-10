import FrontendCloudFrontInfo from "../cloudfront/FrontendCloudFrontInfo";
import FrontendParameterStoreInfo from "./application_management/FrontendParameterStoreInfo";

export default class FrontendSsmInfo {
  private readonly frontendParameterStoreInfo: FrontendParameterStoreInfo;

  constructor(frontendCloudFrontInfo: FrontendCloudFrontInfo) {
    this.frontendParameterStoreInfo = new FrontendParameterStoreInfo(
      frontendCloudFrontInfo,
    );
  }
}
