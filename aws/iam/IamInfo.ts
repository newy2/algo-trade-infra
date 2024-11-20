import RoleInfo from "./access_management/RoleInfo";

export class IamInfo {
  private readonly roleInfo: RoleInfo;

  constructor() {
    this.roleInfo = new RoleInfo();
  }

  public getEc2RoleId() {
    return this.roleInfo.getEc2RoleId();
  }
}
