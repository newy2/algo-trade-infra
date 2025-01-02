import LaunchTemplateInfo from "./instance/LaunchTemplateInfo";
import AutoScalingInfo from "./auto_scaling/AutoScalingInfo";
import BackendAppInfra from "../../backend_app_infra/BackendAppInfra";
import CommonInfra from "../../common_infra/CommonInfra";

export default class Ec2Info {
  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    const launchTemplateInfo = new LaunchTemplateInfo(
      backendAppInfraList,
      commonInfra,
    );
    new AutoScalingInfo(commonInfra, launchTemplateInfo);
  }
}
