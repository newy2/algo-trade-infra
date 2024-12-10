import CommonIamInfo from "./iam/CommonIamInfo";
import CommonLambdaInfo from "./lambda/CommonLambdaInfo";

export default class CommonInfra {
  public readonly iamInfo: CommonIamInfo;
  public readonly lambdaInfo: CommonLambdaInfo;

  constructor() {
    this.iamInfo = new CommonIamInfo();
    this.lambdaInfo = new CommonLambdaInfo();
  }
}
