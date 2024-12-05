import { Group } from "@pulumi/aws/autoscaling";
import * as aws from "@pulumi/aws";
import VpcInfo from "../../vpc/VpcInfo";
import LaunchTemplateInfo from "../instance/LaunchTemplateInfo";
import TargetGroupInfo from "../load_balancing/TargetGroupInfo";

export default class AutoScalingInfo {
  private readonly backendServerAutoScalingGroup: Group;

  constructor(
    vpcInfo: VpcInfo,
    launchTemplateInfo: LaunchTemplateInfo,
    targetGroupInfo: TargetGroupInfo,
  ) {
    this.backendServerAutoScalingGroup =
      this.createBackendServerAutoScalingGroup(
        vpcInfo,
        launchTemplateInfo,
        targetGroupInfo,
      );
  }

  private createBackendServerAutoScalingGroup(
    vpcInfo: VpcInfo,
    launchTemplateInfo: LaunchTemplateInfo,
    targetGroupInfo: TargetGroupInfo,
  ) {
    const name = "backend-server-autoscaling-group";
    return new aws.autoscaling.Group(name, {
      name,
      desiredCapacity: 1,
      maxSize: 1,
      minSize: 1,
      vpcZoneIdentifiers: [vpcInfo.getFirstPublicSubnetId()],
      healthCheckType: "EC2",
      launchTemplate: {
        id: launchTemplateInfo.getBackendSeverLaunchTemplateId(),
      },
      targetGroupArns: [targetGroupInfo.getBackendServerTargetGroupArn()],
    });
  }
}
