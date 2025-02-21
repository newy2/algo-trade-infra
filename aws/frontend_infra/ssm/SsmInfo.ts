import CloudFrontInfo from "../cloud_front/CloudFrontInfo";
import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import { AppEnv } from "../../util/enums";

export default class SsmInfo {
  constructor(appEnv: AppEnv, cloudFrontInfo: CloudFrontInfo) {
    new ParameterStoreInfo(appEnv, cloudFrontInfo);
  }
}
