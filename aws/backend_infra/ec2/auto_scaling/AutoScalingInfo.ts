import * as aws from "@pulumi/aws";
import LaunchTemplateInfo from "../instance/LaunchTemplateInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class AutoScalingInfo extends BaseAwsInfo {
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
      desiredCapacity: 1,
      maxSize: 1,
      minSize: 1,
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
