import RoleInfo from "./access_management/RoleInfo";
import CommonPolicyInfo from "../../common_infra/iam/access_management/CommonPolicyInfo";

export default class IamInfo {
  public readonly frontendRoleInfo: RoleInfo;

  constructor(commonPolicyInfo: CommonPolicyInfo) {
    this.frontendRoleInfo = new RoleInfo(commonPolicyInfo);
  }
}
