import VpcInfo from "../../common_infra/vpc/VpcInfo";
import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";
import IamInfo from "../../common_infra/iam/IamInfo";

export default class Ec2Info {
  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    const launchTemplateInfo = new LaunchTemplateInfo(vpcInfo, iamInfo);
    new AutoScalingInfo(vpcInfo, launchTemplateInfo);
  }
}
