import VpcInfo from "./aws/vpc/VpcInfo";
import { IamInfo } from "./aws/iam/IamInfo";
import EventBridgeInfo from "./aws/event_bridge/EventBridgeInfo";
import SsmInfo from "./aws/ssm/SsmInfo";
import EcrInfo from "./aws/ecr/EcrInfo";
import LambdaInfo from "./aws/lambda/LambdaInfo";
import { RdsInfo } from "./aws/rds/RdsInfo";
import S3Info from "./aws/s3/S3Info";
import CloudFrontInfo from "./aws/cloudfront/CloudFrontInfo";
import SqsInfo from "./aws/sqs/SqsInfo";
import Ec2Info from "./aws/ec2/Ec2Info";

const vpcInfo = new VpcInfo();

const iamInfo = new IamInfo();
const ecrInfo = new EcrInfo();
const sqsInfo = new SqsInfo();
const s3Info = new S3Info();
const rdsInfo = new RdsInfo(vpcInfo);
new Ec2Info(vpcInfo, iamInfo);
const cloudfrontInfo = new CloudFrontInfo(s3Info);
const lambdaInfo = new LambdaInfo(iamInfo, sqsInfo, s3Info, cloudfrontInfo);
new EventBridgeInfo(ecrInfo, lambdaInfo);

// TODO Refector: 각 Info 에서 SsmInfo 를 호출하도록 할까?
new SsmInfo(vpcInfo, ecrInfo, rdsInfo, cloudfrontInfo);
