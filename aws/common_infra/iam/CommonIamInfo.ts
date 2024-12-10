import CommonPolicyInfo from "./access_management/CommonPolicyInfo";

export default class CommonIamInfo {
  public readonly commonPolicyInfo: CommonPolicyInfo;

  constructor() {
    this.commonPolicyInfo = new CommonPolicyInfo();
  }
}
