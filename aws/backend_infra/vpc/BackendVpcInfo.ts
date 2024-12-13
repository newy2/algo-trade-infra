import SecurityGroupInfo from "./security/SecurityGroupInfo";
import CommonVpcInfo from "../../common_infra/vpc/VpcInfo";

export default class BackendVpcInfo {
  public readonly securityGroupInfo: SecurityGroupInfo;

  constructor(commonVpcInfo: CommonVpcInfo) {
    this.securityGroupInfo = new SecurityGroupInfo(commonVpcInfo.defaultVpc);
  }
}
