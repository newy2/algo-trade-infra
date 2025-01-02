import SubnetGroupInfo from "./default/SubnetGroupInfo";
import InstanceInfo from "./default/InstanceInfo";
import CommonInfra from "../../common_infra/CommonInfra";

export class RdsInfo {
  public readonly instanceInfo: InstanceInfo;

  constructor(commonInfra: CommonInfra) {
    const subnetGroupInfo = new SubnetGroupInfo(commonInfra);
    this.instanceInfo = new InstanceInfo(commonInfra, subnetGroupInfo);
  }
}
