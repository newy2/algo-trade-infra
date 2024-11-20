import VpcInfo from "./aws/vpc/VpcInfo";
import { IamInfo } from "./aws/iam/IamInfo";
import Ec2Info from "./aws/ec2/Ec2Info";
import EventBridgeInfo from "./aws/event_bridge/EventBridgeInfo";
import SsmInfo from "./aws/ssm/SsmInfo";
import EcrInfo from "./aws/ecr/EcrInfo";

const vpcInfo = new VpcInfo();

const iamInfo = new IamInfo();
const ecrInfo = new EcrInfo();
new SsmInfo(ecrInfo);
new Ec2Info(vpcInfo, iamInfo);
new EventBridgeInfo(ecrInfo, iamInfo);

export const defaultVpc = vpcInfo.defaultVpc;
