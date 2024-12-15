import { DefaultVpc } from "@pulumi/aws/ec2";
import { createNameTag } from "../../../../util/utils";

export default class NetworkAclInfo {
  constructor(defaultVpc: DefaultVpc) {
    this.changeDefaultNetworkAclName(defaultVpc);
  }

  private changeDefaultNetworkAclName(defaultVpc: DefaultVpc) {
    createNameTag("default-nacl-name", {
      resourceId: defaultVpc.defaultNetworkAclId,
      value: "Default NACL",
    });
  }
}
