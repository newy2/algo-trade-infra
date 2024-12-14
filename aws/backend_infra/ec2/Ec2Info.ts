import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";
import IamInfo from "../../common_infra/iam/IamInfo";
import VpcInfo from "../../common_infra/vpc/VpcInfo";
import BackendAppInfra from "../../backend_app_infra/BackendAppInfra";

export default class Ec2Info {
  constructor(
    vpcInfo: VpcInfo,
    backendAppInfraList: BackendAppInfra[],
    iamInfo: IamInfo,
  ) {
    const launchTemplateInfo = new LaunchTemplateInfo(
      vpcInfo,
      backendAppInfraList,
      iamInfo,
    );
    new AutoScalingInfo(vpcInfo, launchTemplateInfo);
  }
}
