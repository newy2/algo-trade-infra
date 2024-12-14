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
    commonInfra: CommonInfra,
    backendAppInfraList: BackendAppInfra[],
  ) {
    const sqsInfo = new SqsInfo();
    const rdsInfo = new RdsInfo(commonInfra.vpcInfo);
    new Ec2Info(commonInfra.vpcInfo, backendAppInfraList, commonInfra.iamInfo);
    const lambdaInfo = new LambdaInfo(
      commonInfra.iamInfo,
      commonInfra.lambdaInfo,
      backendAppInfraList,
    );
    new EventBridgeInfo(backendAppInfraList, lambdaInfo);
    new SsmInfo(rdsInfo, sqsInfo);
  }
}
