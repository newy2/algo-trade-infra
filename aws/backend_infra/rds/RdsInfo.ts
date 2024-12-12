import VpcInfo from "../../common_infra/vpc/VpcInfo";
import SubnetGroupInfo from "./default/SubnetGroupInfo";
import InstanceInfo from "./default/InstanceInfo";

export class RdsInfo {
  public readonly instanceInfo: InstanceInfo;

  constructor(vpcInfo: VpcInfo) {
    const subnetGroupInfo = new SubnetGroupInfo(vpcInfo);
    this.instanceInfo = new InstanceInfo(vpcInfo, subnetGroupInfo);
  }
}
