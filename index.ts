import VpcInfo from "./aws/vpc/VpcInfo";
import IamInfo from "./aws/iam/IamInfo";
import CommonIamInfo from "./common_infra/iam/CommonIamInfo";
import EventBridgeInfo from "./aws/event_bridge/EventBridgeInfo";
import SsmInfo from "./aws/ssm/SsmInfo";
import EcrInfo from "./aws/ecr/EcrInfo";
import LambdaInfo from "./aws/lambda/LambdaInfo";
import CommonLambdaInfo from "./common_infra/lambda/CommonLambdaInfo";
import { RdsInfo } from "./aws/rds/RdsInfo";
import CloudFrontInfo from "./aws/cloudfront/CloudFrontInfo";
import SqsInfo from "./aws/sqs/SqsInfo";
import Ec2Info from "./aws/ec2/Ec2Info";
import FrontendInfra from "./frontend_infra/FrontendInfra";

const commonIamInfo = new CommonIamInfo();
const commonLambdaInfo = new CommonLambdaInfo();

const vpcInfo = new VpcInfo();
const iamInfo = new IamInfo(commonIamInfo.commonPolicyInfo);
const ecrInfo = new EcrInfo();
const sqsInfo = new SqsInfo();
const rdsInfo = new RdsInfo(vpcInfo);
new Ec2Info(vpcInfo, iamInfo);
const cloudfrontInfo = new CloudFrontInfo();
const lambdaInfo = new LambdaInfo(iamInfo, commonLambdaInfo);
new EventBridgeInfo(ecrInfo, lambdaInfo);
// TODO Refector: 각 Info 에서 SsmInfo 를 호출하도록 할까?
new SsmInfo(vpcInfo, ecrInfo, rdsInfo, cloudfrontInfo, sqsInfo);

new FrontendInfra(commonIamInfo, commonLambdaInfo);
