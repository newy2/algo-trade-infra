import S3Info from "./s3/S3Info";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import LambdaInfo from "./lambda/LambdaInfo";
import SnsInfo from "./sns/SnsInfo";
import SsmInfo from "./ssm/SsmInfo";
import CommonInfra from "../common_infra/CommonInfra";

export default class FrontendInfra {
  constructor(commonInfra: CommonInfra) {
    const s3Info = new S3Info();
    const cloudFrontInfo = new CloudFrontInfo(s3Info);
    const lambdaInfo = new LambdaInfo(
      commonInfra.iamInfo,
      s3Info,
      commonInfra.lambdaInfo,
    );
    new SnsInfo(lambdaInfo);
    new SsmInfo(cloudFrontInfo);
  }
}
