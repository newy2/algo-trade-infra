import ParameterStoreInfo from "./application_management/ParameterStoreInfo";
import { RdsInfo } from "../rds/RdsInfo";
import SqsInfo from "../sqs/SqsInfo";

export default class SsmInfo {
  constructor(rdsInfo: RdsInfo, sqsInfo: SqsInfo) {
    new ParameterStoreInfo(rdsInfo, sqsInfo);
  }
}
