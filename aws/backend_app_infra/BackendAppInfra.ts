import { AppEnv } from "../util/enums";
import CloudFrontInfo from "./cloud_front/CloudFrontInfo";
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

  constructor({ appEnv, httpPort, commonInfra }: BackendAppInfraParam) {
    this.appEnv = appEnv;
    this.ecrInfo = new EcrInfo(appEnv);
    this.ec2Info = new Ec2Info(appEnv);
    this.vpcInfo = new VpcInfo(appEnv, httpPort, commonInfra);
    const cloudFrontInfo = new CloudFrontInfo(appEnv, httpPort);
    new SsmInfo(appEnv, httpPort, this.ecrInfo, cloudFrontInfo);
  }
}
