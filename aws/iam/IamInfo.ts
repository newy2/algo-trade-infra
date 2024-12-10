import RoleInfo from "./access_management/RoleInfo";
import PolicyInfo from "./access_management/PolicyInfo";
import CommonPolicyInfo from "../../common_infra/iam/access_management/CommonPolicyInfo";

export default class IamInfo {
  public readonly roleInfo: RoleInfo;

  constructor(commonPolicyInfo: CommonPolicyInfo) {
    const policyInfo = new PolicyInfo();
    this.roleInfo = new RoleInfo(policyInfo, commonPolicyInfo);
  }
}
