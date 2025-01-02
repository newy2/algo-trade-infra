import SqsInfo from "./sqs/SqsInfo";
import { RdsInfo } from "./rds/RdsInfo";
import Ec2Info from "./ec2/Ec2Info";
import LambdaInfo from "./lambda/LambdaInfo";
import EventBridgeInfo from "./event_bridge/EventBridgeInfo";
import SsmInfo from "./ssm/SsmInfo";
import CommonInfra from "../common_infra/CommonInfra";
import BackendAppInfra from "../backend_app_infra/BackendAppInfra";

export default class BackendInfra {
  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    const sqsInfo = new SqsInfo();
    const rdsInfo = new RdsInfo(commonInfra);
    new Ec2Info(backendAppInfraList, commonInfra);
    const lambdaInfo = new LambdaInfo(backendAppInfraList, commonInfra);
    new EventBridgeInfo(backendAppInfraList, lambdaInfo);
    new SsmInfo(rdsInfo, sqsInfo);
  }
}
