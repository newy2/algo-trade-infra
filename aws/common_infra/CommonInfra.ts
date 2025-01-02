import IamInfo from "./iam/IamInfo";
import LambdaInfo from "./lambda/LambdaInfo";
import VpcInfo from "./vpc/VpcInfo";
import SsmInfo from "./ssm/SsmInfo";

export default class CommonInfra {
  public readonly vpcInfo: VpcInfo;
  public readonly iamInfo: IamInfo;
  public readonly lambdaInfo: LambdaInfo;

  constructor() {
    this.vpcInfo = new VpcInfo();
    this.iamInfo = new IamInfo();
    this.lambdaInfo = new LambdaInfo();
    new SsmInfo(this.vpcInfo);
  }
}
