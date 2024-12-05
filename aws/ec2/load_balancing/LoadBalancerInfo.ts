import BaseAwsInfo from "../../BaseAwsInfo";
import { LoadBalancer } from "@pulumi/aws/lb";
import * as aws from "@pulumi/aws";
import VpcInfo from "../../vpc/VpcInfo";
import TargetGroupInfo from "./TargetGroupInfo";

export default class LoadBalancerInfo extends BaseAwsInfo {
  private readonly backendServerLoadBalancer: LoadBalancer;

  constructor(vpcInfo: VpcInfo, targetGroupInfo: TargetGroupInfo) {
    super();

    this.backendServerLoadBalancer = this.createBackendServerLoadBalancer(
      vpcInfo,
      targetGroupInfo,
    );
  }

  private createBackendServerLoadBalancer(
    vpcInfo: VpcInfo,
    targetGroupInfo: TargetGroupInfo,
  ) {
    const name = "backend-server-load-balancer";

    const result = new aws.lb.LoadBalancer(name, {
      name,
      internal: false,
      loadBalancerType: "application",
      securityGroups: vpcInfo.getLoadBalancerSecurityGroupIds(),
      subnets: vpcInfo.getLoadBalancerSubnetIds(),
      enableDeletionProtection: false,
      ipAddressType: "dualstack-without-public-ipv4",
    });

    new aws.lb.Listener(`${name}-listener`, {
      loadBalancerArn: result.arn,
      port: 80,
      protocol: "HTTP",
      defaultActions: [
        {
          type: "forward",
          targetGroupArn: targetGroupInfo.getBackendServerTargetGroupArn(),
        },
      ],
    });

    return result;
  }
}
