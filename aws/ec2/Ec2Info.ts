import { IamInfo } from "../iam/IamInfo";
import InstanceInfo from "./instance/InstanceInfo";
import VpcInfo from "../vpc/VpcInfo";

export default class Ec2Info {
  private readonly instanceInfo: InstanceInfo;

  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    this.instanceInfo = new InstanceInfo(vpcInfo, iamInfo);
  }
}
