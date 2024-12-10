import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import EcrInfo from "../ecr/EcrInfo";
import { RdsInfo } from "../rds/RdsInfo";
import VpcInfo from "../vpc/VpcInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import SqsInfo from "../sqs/SqsInfo";
import FrontendCloudFrontInfo from "../../frontend_infra/cloudfront/FrontendCloudFrontInfo";

export default class SsmInfo {
  private readonly parameterStoreInfo: ParameterStoreInfo;

  constructor(
    vpcInfo: VpcInfo,
    ecrInfo: EcrInfo,
    rdsInfo: RdsInfo,
    cloudFrontInfo: CloudFrontInfo,
    frontendCloudFrontInfo: FrontendCloudFrontInfo,
    sqsInfo: SqsInfo,
  ) {
    this.parameterStoreInfo = new ParameterStoreInfo(
      vpcInfo,
      ecrInfo,
      rdsInfo,
      cloudFrontInfo,
      frontendCloudFrontInfo,
      sqsInfo,
    );
  }
}
