import VpcInfo from "../vpc/VpcInfo";
import SubnetGroupInfo from "./default/SubnetGroupInfo";
import InstanceInfo from "./default/InstanceInfo";

export class RdsInfo {
  private readonly subnetGroupInfo: SubnetGroupInfo;
  private readonly instanceInfo: InstanceInfo;

  constructor(vpcInfo: VpcInfo) {
    this.subnetGroupInfo = new SubnetGroupInfo(vpcInfo);
    this.instanceInfo = new InstanceInfo(vpcInfo, this.subnetGroupInfo);
  }

  public getEndpoint() {
    return this.instanceInfo.getEndpoint();
  }

  public getAddress() {
    return this.instanceInfo.getAddress();
  }

  public getUsername() {
    return this.instanceInfo.getUsername();
  }

  public getPassword() {
    return this.instanceInfo.getPassword();
  }
}
