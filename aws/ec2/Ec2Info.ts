import IamInfo from "../iam/IamInfo";
import VpcInfo from "../vpc/VpcInfo";
import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";

export default class Ec2Info {
  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    const launchTemplateInfo = new LaunchTemplateInfo(vpcInfo, iamInfo);
    new AutoScalingInfo(vpcInfo, launchTemplateInfo);
  }
}
