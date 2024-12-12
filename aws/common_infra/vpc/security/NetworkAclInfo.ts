import { DefaultVpc } from "@pulumi/aws/ec2";
import BaseAwsInfo from "../../../backend_infra/BaseAwsInfo";

export default class NetworkAclInfo extends BaseAwsInfo {
  constructor(defaultVpc: DefaultVpc) {
    super();

    this.changeDefaultNetworkAclName(defaultVpc);
  }

  private changeDefaultNetworkAclName(defaultVpc: DefaultVpc) {
    this.createNameTag("default-nacl-name", {
      resourceId: defaultVpc.defaultNetworkAclId,
      value: "Default NACL",
    });
  }
}
