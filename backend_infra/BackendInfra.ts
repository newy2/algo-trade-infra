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
import CommonIamInfo from "../common_infra/iam/CommonIamInfo";
import CommonLambdaInfo from "../common_infra/lambda/CommonLambdaInfo";

export default class BackendInfra {
  constructor(
    commonIamInfo: CommonIamInfo,
    commonLambdaInfo: CommonLambdaInfo,
  ) {
    const vpcInfo = new VpcInfo();
    const iamInfo = new IamInfo(commonIamInfo.commonPolicyInfo);
    const ecrInfo = new EcrInfo();
    const sqsInfo = new SqsInfo();
    const rdsInfo = new RdsInfo(vpcInfo);
    new Ec2Info(vpcInfo, iamInfo);
    const cloudfrontInfo = new CloudFrontInfo();
    const lambdaInfo = new LambdaInfo(iamInfo, commonLambdaInfo);
    new EventBridgeInfo(ecrInfo, lambdaInfo);
    new SsmInfo(vpcInfo, ecrInfo, rdsInfo, cloudfrontInfo, sqsInfo);
  }
}
