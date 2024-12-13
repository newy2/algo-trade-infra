import PolicyInfo from "./access_management/PolicyInfo";
import RoleInfo from "./access_management/RoleInfo";

export default class IamInfo {
  public readonly policyInfo: PolicyInfo;
  public readonly roleInfo: RoleInfo;

  constructor() {
    this.policyInfo = new PolicyInfo();
    this.roleInfo = new RoleInfo(this.policyInfo);
  }
}
