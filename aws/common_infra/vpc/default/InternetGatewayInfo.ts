import { Output } from "@pulumi/pulumi";
import { DefaultVpc, GetInternetGatewayResult } from "@pulumi/aws/ec2";
import * as aws from "@pulumi/aws";
import AwsConfig from "../../../../util/AwsConfig";
import { createNameTag } from "../../../../util/utils";

export default class InternetGatewayInfo extends AwsConfig {
  private readonly internetGateway: Output<GetInternetGatewayResult>;

  constructor(defaultVpc: DefaultVpc) {
    super();

    this.internetGateway = this.findDefaultInternetGateway(defaultVpc);
  }

  public getInternetGatewayId() {
    return this.internetGateway.id;
  }

  private findDefaultInternetGateway(defaultVpc: DefaultVpc) {
    const findResource = (vpcId: string) =>
      aws.ec2.getInternetGateway({
        filters: [
          {
            name: "attachment.vpc-id",
            values: [vpcId], // (TODO Refector) pulumi.Input 타입을 지원하지 않아서, 일단 체이닝 함수로 구현함.
          },
        ],
      });

    const changeResourceName = (resource: GetInternetGatewayResult) => {
      createNameTag("default-internet-gateway-name", {
        resourceId: resource.id,
        value: "Default Internet Gateway",
      });
      return resource;
    };

    return defaultVpc.id.apply(findResource).apply(changeResourceName);
  }
}
