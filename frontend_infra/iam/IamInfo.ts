import RoleInfo from "./access_management/RoleInfo";
import CommonPolicyInfo from "../../common_infra/iam/access_management/CommonPolicyInfo";

export default class IamInfo {
  private readonly frontendRoleInfo: RoleInfo;

  constructor(commonPolicyInfo: CommonPolicyInfo) {
    this.frontendRoleInfo = new RoleInfo(commonPolicyInfo);
  }

  public getFrontendDeliveryLambdaRole() {
    return this.frontendRoleInfo.getFrontendDeliveryLambdaRole();
  }
}
