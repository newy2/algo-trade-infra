import RoleInfo from "./access_management/RoleInfo";
import PolicyInfo from "./access_management/PolicyInfo";

export class IamInfo {
  private readonly policyInfo: PolicyInfo;
  private readonly roleInfo: RoleInfo;

  constructor() {
    this.policyInfo = new PolicyInfo();
    this.roleInfo = new RoleInfo(this.policyInfo);
  }

  public getEventBridgeEcrPushRuleRoleArn() {
    return this.roleInfo.getEventBridgeEcrPushRuleRoleArn();
  }

  public getEc2InstanceProfileId() {
    return this.roleInfo.getEc2InstanceProfileId();
  }

  public getEc2InstanceProfileArn() {
    return this.roleInfo.getEc2InstanceProfileArn();
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
