import S3Info from "./s3/S3Info";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import LambdaInfo from "./lambda/LambdaInfo";
import SnsInfo from "./sns/SnsInfo";
import SsmInfo from "./ssm/SsmInfo";
import IamInfo from "./iam/IamInfo";
import CommonIamInfo from "../common_infra/iam/CommonIamInfo";
import CommonLambdaInfo from "../common_infra/lambda/CommonLambdaInfo";

export default class FrontendInfra {
  constructor(
    commonIamInfo: CommonIamInfo,
    commonLambdaInfo: CommonLambdaInfo,
  ) {
    const s3Info = new S3Info();
    const iamInfo = new IamInfo(commonIamInfo.commonPolicyInfo);
    const cloudFrontInfo = new CloudFrontInfo(s3Info);
    const lambdaInfo = new LambdaInfo(iamInfo, s3Info, commonLambdaInfo);
    new SnsInfo(lambdaInfo);
    new SsmInfo(cloudFrontInfo);
  }
}
