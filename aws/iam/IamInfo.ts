import RoleInfo from "./access_management/RoleInfo";
import PolicyInfo from "./access_management/PolicyInfo";

export class IamInfo {
  private readonly policyInfo: PolicyInfo;
  private readonly roleInfo: RoleInfo;

  constructor() {
    this.policyInfo = new PolicyInfo();
    this.roleInfo = new RoleInfo(this.policyInfo);
  }

  public getLambdaRoleArn() {
    return this.roleInfo.getLambdaRoleArn();
  }

  public getFrontendDeliveryLambdaRole() {
    return this.roleInfo.getFrontendDeliveryLambdaRole();
  }

  public getSendSlackMessageLambdaRole() {
    return this.roleInfo.getSendSlackMessageLambdaRole();
  }
}
