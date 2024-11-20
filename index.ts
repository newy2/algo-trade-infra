import VpcInfo from "./aws/vpc/VpcInfo";
import { IamInfo } from "./aws/iam/IamInfo";
import Ec2Info from "./aws/ec2/Ec2Info";

const vpcInfo = new VpcInfo();

const iamInfo = new IamInfo();
const ec2Info = new Ec2Info(vpcInfo, iamInfo);
export const defaultVpc = vpcInfo.defaultVpc;
