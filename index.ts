import VpcInfo from "./aws/vpc/VpcInfo";
import { IamInfo } from "./aws/iam/IamInfo";
import EventBridgeInfo from "./aws/event_bridge/EventBridgeInfo";
import SsmInfo from "./aws/ssm/SsmInfo";
import EcrInfo from "./aws/ecr/EcrInfo";
import LambdaInfo from "./aws/lambda/LambdaInfo";
import Ec2Info from "./aws/ec2/Ec2Info";
import { RdsInfo } from "./aws/rds/RdsInfo";

const vpcInfo = new VpcInfo();

const iamInfo = new IamInfo();
const ecrInfo = new EcrInfo();
const lambdaInfo = new LambdaInfo(iamInfo);
const rdsInfo = new RdsInfo(vpcInfo);
new SsmInfo(vpcInfo, ecrInfo, rdsInfo);
new Ec2Info(vpcInfo, iamInfo);
new EventBridgeInfo(ecrInfo, iamInfo, lambdaInfo);

export const defaultVpc = vpcInfo.defaultVpc;
