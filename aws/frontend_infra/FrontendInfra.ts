import S3Info from "./s3/S3Info";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import LambdaInfo from "./lambda/LambdaInfo";
import SnsInfo from "./sns/SnsInfo";
import SsmInfo from "./ssm/SsmInfo";
import CommonInfra from "../common_infra/CommonInfra";
import { AppEnv } from "../util/enums";

export default class FrontendInfra {
  constructor(appEnv: AppEnv, commonInfra: CommonInfra) {
    const s3Info = new S3Info(appEnv);
    const cloudFrontInfo = new CloudFrontInfo(appEnv, s3Info);
    const lambdaInfo = new LambdaInfo(appEnv, commonInfra, s3Info);
    new SnsInfo(appEnv, lambdaInfo);
    new SsmInfo(appEnv, cloudFrontInfo);
  }
}
