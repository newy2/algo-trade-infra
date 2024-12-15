import * as aws from "@pulumi/aws";
import LaunchTemplateInfo from "../instance/LaunchTemplateInfo";
import AwsConfig from "../../../util/AwsConfig";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class AutoScalingInfo extends AwsConfig {
  constructor(
    commonInfra: CommonInfra,
    launchTemplateInfo: LaunchTemplateInfo,
  ) {
    super();

    this.createBackendServerAutoScalingGroup(commonInfra, launchTemplateInfo);
  }

  private createBackendServerAutoScalingGroup(
    commonInfra: CommonInfra,
    launchTemplateInfo: LaunchTemplateInfo,
  ) {
    const name = this.getBackendServerAutoScalingGroupName();
    return new aws.autoscaling.Group(name, {
      name,
      desiredCapacity: 0,
      maxSize: 0,
      minSize: 0,
      vpcZoneIdentifiers: [
        commonInfra.vpcInfo.subnetInfo.getFirstPublicSubnetId(),
      ],
      healthCheckType: "EC2",
      launchTemplate: {
        id: launchTemplateInfo.getBackendSeverLaunchTemplateId(),
      },
    });
  }
}
