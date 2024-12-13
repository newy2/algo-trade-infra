import IamInfo from "./iam/IamInfo";
import CommonLambdaInfo from "./lambda/CommonLambdaInfo";
import VpcInfo from "./vpc/VpcInfo";
import SsmInfo from "./ssm/SsmInfo";

export default class CommonInfra {
  public readonly vpcInfo: VpcInfo;
  public readonly iamInfo: IamInfo;
  public readonly lambdaInfo: CommonLambdaInfo;

  constructor() {
    this.vpcInfo = new VpcInfo();
    this.iamInfo = new IamInfo();
    this.lambdaInfo = new CommonLambdaInfo();
    new SsmInfo(this.vpcInfo);
  }
}
