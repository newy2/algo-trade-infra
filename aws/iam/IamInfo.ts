import RoleInfo from "./access_management/RoleInfo";
import PolicyInfo from "./access_management/PolicyInfo";

export class IamInfo {
  private readonly policyInfo: PolicyInfo;
  private readonly roleInfo: RoleInfo;

  constructor() {
    this.policyInfo = new PolicyInfo();
    this.roleInfo = new RoleInfo(this.policyInfo);
  }

  public getEcrCleanupLambdaRoleArn() {
    return this.roleInfo.getEcrCleanupLambdaRoleArn();
  }

  public getFrontendDeliveryLambdaRole() {
    return this.roleInfo.getFrontendDeliveryLambdaRole();
  }

  public getEc2InstanceProfileArn() {
    return this.roleInfo.getEc2InstanceProfileArn();
  }

  public getBackendDeliveryInitRoleArn() {
    return this.roleInfo.getBackendDeliveryInitRoleArn();
  }

  public getBackendDeliveryProcessingRoleArn() {
    return this.roleInfo.getBackendDeliveryProcessingRoleArn();
  }

  public getBackendDeliveryCompleteRoleArn() {
    return this.roleInfo.getBackendDeliveryCompleteRoleArn();
  }

  public getBackendDeliveryEventSourceMapperRoleArn() {
    return this.roleInfo.getBackendDeliveryEventSourceMapperRoleArn();
  }
}
