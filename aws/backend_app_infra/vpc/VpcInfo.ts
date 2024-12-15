import SecurityGroupInfo from "./security/SecurityGroupInfo";
import { AppEnv } from "../../util/enums";
import CommonInfra from "../../common_infra/CommonInfra";

export default class VpcInfo {
  public readonly securityGroupInfo: SecurityGroupInfo;

  constructor(appEnv: AppEnv, httpPort: number, commonInfra: CommonInfra) {
    this.securityGroupInfo = new SecurityGroupInfo(
      appEnv,
      httpPort,
      commonInfra,
    );
  }
}
