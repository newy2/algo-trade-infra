import BaseAwsInfo from "../../BaseAwsInfo";
import { TargetGroup } from "@pulumi/aws/lb";
import * as aws from "@pulumi/aws";
import VpcInfo from "../../vpc/VpcInfo";

export default class TargetGroupInfo extends BaseAwsInfo {
  private readonly backendServerTargetGroup: TargetGroup;

  constructor(vpcInfo: VpcInfo) {
    super();

    this.backendServerTargetGroup =
      this.createBackendServerTargetGroup(vpcInfo);
  }

  public getBackendServerTargetGroupArn() {
    return this.backendServerTargetGroup.arn;
  }

  private createBackendServerTargetGroup(vpcInfo: VpcInfo) {
    const name = "backend-server-target-group";
    return new aws.lb.TargetGroup(name, {
      name,
      port: 80,
      protocol: "HTTP",
      vpcId: vpcInfo.getDefaultVpcId(),
      targetType: "instance",
      healthCheck: {
        path: "/ping",
        interval: 30,
        timeout: 5,
        healthyThreshold: 5,
        unhealthyThreshold: 2,
      },
    });
  }
}
