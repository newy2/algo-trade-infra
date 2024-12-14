import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import EcrInfo from "../../backend_app_infra/ecr/EcrInfo";
import CloudFrontInfo from "../../backend_app_infra/cloudfront/CloudFrontInfo";
import { AppEnv } from "../../../util/enums";

export default class SsmInfo {
  constructor(
    appEnv: AppEnv,
    httpPort: number,
    ecrInfo: EcrInfo,
    cloudFrontInfo: CloudFrontInfo,
  ) {
    new ParameterStoreInfo(appEnv, httpPort, ecrInfo, cloudFrontInfo);
  }
}
