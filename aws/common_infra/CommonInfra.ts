import CommonIamInfo from "./iam/CommonIamInfo";
import CommonLambdaInfo from "./lambda/CommonLambdaInfo";
import VpcInfo from "./vpc/VpcInfo";
import SsmInfo from "./ssm/SsmInfo";

export default class CommonInfra {
  public readonly vpcInfo: VpcInfo;
  public readonly iamInfo: CommonIamInfo;
  public readonly lambdaInfo: CommonLambdaInfo;

  constructor() {
    this.vpcInfo = new VpcInfo();
    this.iamInfo = new CommonIamInfo();
    this.lambdaInfo = new CommonLambdaInfo();
    new SsmInfo(this.vpcInfo);
  }
}
