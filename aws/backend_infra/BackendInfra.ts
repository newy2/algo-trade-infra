import VpcInfo from "./vpc/VpcInfo";
import IamInfo from "./iam/IamInfo";
import EcrInfo from "./ecr/EcrInfo";
import SqsInfo from "./sqs/SqsInfo";
import { RdsInfo } from "./rds/RdsInfo";
import Ec2Info from "./ec2/Ec2Info";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import LambdaInfo from "./lambda/LambdaInfo";
import EventBridgeInfo from "./event_bridge/EventBridgeInfo";
import SsmInfo from "./ssm/SsmInfo";
import CommonInfra from "../common_infra/CommonInfra";

export default class BackendInfra {
  constructor(commonInfra: CommonInfra) {
    const vpcInfo = new VpcInfo();
    const iamInfo = new IamInfo(commonInfra.iamInfo.commonPolicyInfo);
    const ecrInfo = new EcrInfo();
    const sqsInfo = new SqsInfo();
    const rdsInfo = new RdsInfo(vpcInfo);
    new Ec2Info(vpcInfo, iamInfo);
    const cloudfrontInfo = new CloudFrontInfo();
    const lambdaInfo = new LambdaInfo(iamInfo, commonInfra.lambdaInfo);
    new EventBridgeInfo(ecrInfo, lambdaInfo);
    new SsmInfo(vpcInfo, ecrInfo, rdsInfo, cloudfrontInfo, sqsInfo);
  }
}
