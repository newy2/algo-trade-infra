import { IamInfo } from "../iam/IamInfo";
import VpcInfo from "../vpc/VpcInfo";
import BaseAwsInfo from "../BaseAwsInfo";
import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";

export default class Ec2Info extends BaseAwsInfo {
  private readonly launchTemplateInfo: LaunchTemplateInfo;
  private readonly autoScalingGroupInfo: AutoScalingInfo;

  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    super();

    this.launchTemplateInfo = new LaunchTemplateInfo(vpcInfo, iamInfo);
    this.autoScalingGroupInfo = new AutoScalingInfo(
      vpcInfo,
      this.launchTemplateInfo,
    );
  }
}
