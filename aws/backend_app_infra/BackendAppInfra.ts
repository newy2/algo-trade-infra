import { AppEnv } from "../../util/enums";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import EcrInfo from "./ecr/EcrInfo";
import SsmInfo from "./ssm/SsmInfo";
import CommonInfra from "../common_infra/CommonInfra";
import VpcInfo from "./vpc/VpcInfo";
import Ec2Info from "./ec2/Ec2Info";

type BackendAppInfraParam = {
  appEnv: AppEnv;
  httpPort: number;
  commonInfra: CommonInfra;
};

export default class BackendAppInfra {
  public readonly appEnv: AppEnv;
  public readonly ecrInfo: EcrInfo;
  public readonly ec2Info: Ec2Info;
  public readonly vpcInfo: VpcInfo;

  constructor(param: BackendAppInfraParam) {
    this.appEnv = param.appEnv;
    this.ecrInfo = new EcrInfo(param.appEnv);
    this.ec2Info = new Ec2Info(param.appEnv);
    this.vpcInfo = new VpcInfo(param.appEnv, param.httpPort, param.commonInfra);
    const cloudFrontInfo = new CloudFrontInfo(param.appEnv, param.httpPort);
    new SsmInfo(param.appEnv, param.httpPort, this.ecrInfo, cloudFrontInfo);
  }
}
