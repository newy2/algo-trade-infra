import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import EcrInfo from "../ecr/EcrInfo";
import { RdsInfo } from "../rds/RdsInfo";
import CloudFrontInfo from "../cloudfront/CloudFrontInfo";
import SqsInfo from "../sqs/SqsInfo";

export default class SsmInfo {
  constructor(
    ecrInfo: EcrInfo,
    rdsInfo: RdsInfo,
    cloudFrontInfo: CloudFrontInfo,
    sqsInfo: SqsInfo,
  ) {
    new ParameterStoreInfo(ecrInfo, rdsInfo, cloudFrontInfo, sqsInfo);
  }
}
