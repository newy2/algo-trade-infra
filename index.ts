import VpcInfo from "./aws/vpc/VpcInfo";
import { IamInfo } from "./aws/iam/IamInfo";
import EventBridgeInfo from "./aws/event_bridge/EventBridgeInfo";
import SsmInfo from "./aws/ssm/SsmInfo";
import FrontendSsmInfo from "./frontend_infra/ssm/FrontendSsmInfo";
import EcrInfo from "./aws/ecr/EcrInfo";
import LambdaInfo from "./aws/lambda/LambdaInfo";
import CommonLambdaInfo from "./common_infra/lambda/CommonLambdaInfo";
import FrontendLambdaInfo from "./frontend_infra/lambda/FrontendLambdaInfo";
import { RdsInfo } from "./aws/rds/RdsInfo";
import S3Info from "./frontend_infra/s3/S3Info";
import CloudFrontInfo from "./aws/cloudfront/CloudFrontInfo";
import FrontendCloudFrontInfo from "./frontend_infra/cloudfront/FrontendCloudFrontInfo";
import SqsInfo from "./aws/sqs/SqsInfo";
import SnsInfo from "./frontend_infra/sns/SnsInfo";
import Ec2Info from "./aws/ec2/Ec2Info";

const vpcInfo = new VpcInfo();

const iamInfo = new IamInfo();
const ecrInfo = new EcrInfo();
const sqsInfo = new SqsInfo();
const s3Info = new S3Info();
const rdsInfo = new RdsInfo(vpcInfo);
new Ec2Info(vpcInfo, iamInfo);
const cloudfrontInfo = new CloudFrontInfo();
const frontendCloudfrontInfo = new FrontendCloudFrontInfo(s3Info);

const commonLambdaInfo = new CommonLambdaInfo();
const lambdaInfo = new LambdaInfo(iamInfo, commonLambdaInfo);
const frontendLambdaInfo = new FrontendLambdaInfo(
  iamInfo,
  s3Info,
  commonLambdaInfo,
);

new SnsInfo(frontendLambdaInfo);
new EventBridgeInfo(ecrInfo, lambdaInfo);

// TODO Refector: 각 Info 에서 SsmInfo 를 호출하도록 할까?
new SsmInfo(vpcInfo, ecrInfo, rdsInfo, cloudfrontInfo, sqsInfo);
new FrontendSsmInfo(frontendCloudfrontInfo);
