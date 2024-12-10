import FrontendRoleInfo from "./access_management/FrontendRoleInfo";
import CommonPolicyInfo from "../../common_infra/iam/access_management/CommonPolicyInfo";

export default class FrontendIamInfo {
  private readonly frontendRoleInfo: FrontendRoleInfo;

  constructor(commonPolicyInfo: CommonPolicyInfo) {
    this.frontendRoleInfo = new FrontendRoleInfo(commonPolicyInfo);
  }

  public getFrontendDeliveryLambdaRole() {
    return this.frontendRoleInfo.getFrontendDeliveryLambdaRole();
  }
}
