import { IamInfo } from "../iam/IamInfo";
import VpcInfo from "../vpc/VpcInfo";
import BaseAwsInfo from "../BaseAwsInfo";
import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import TargetGroupInfo from "./load_balancing/TargetGroupInfo";
import LoadBalancerInfo from "./load_balancing/LoadBalancerInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";

export default class Ec2Info extends BaseAwsInfo {
  private readonly launchTemplateInfo: LaunchTemplateInfo;
  private readonly targetGroupInfo: TargetGroupInfo;
  private readonly loadBalancerInfo: LoadBalancerInfo;
  private readonly autoScalingGroupInfo: AutoScalingInfo;

  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    super();

    this.launchTemplateInfo = new LaunchTemplateInfo(vpcInfo, iamInfo);
    this.targetGroupInfo = new TargetGroupInfo(vpcInfo);
    this.autoScalingGroupInfo = new AutoScalingInfo(
      vpcInfo,
      this.launchTemplateInfo,
      this.targetGroupInfo,
    );
    this.loadBalancerInfo = new LoadBalancerInfo(vpcInfo, this.targetGroupInfo);
  }
}
