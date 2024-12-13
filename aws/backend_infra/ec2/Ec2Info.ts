import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";
import IamInfo from "../../common_infra/iam/IamInfo";
import BackendVpcInfo from "../vpc/BackendVpcInfo";
import VpcInfo from "../../common_infra/vpc/VpcInfo";

export default class Ec2Info {
  constructor(
    vpcInfo: VpcInfo,
    backendVpcInfo: BackendVpcInfo,
    iamInfo: IamInfo,
  ) {
    const launchTemplateInfo = new LaunchTemplateInfo(
      vpcInfo,
      backendVpcInfo,
      iamInfo,
    );
    new AutoScalingInfo(vpcInfo, launchTemplateInfo);
  }
}
