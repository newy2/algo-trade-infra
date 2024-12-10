import S3Info from "./s3/S3Info";
import CloudFrontInfo from "./cloudfront/CloudFrontInfo";
import FrontendLambdaInfo from "./lambda/FrontendLambdaInfo";
import SnsInfo from "./sns/SnsInfo";
import FrontendSsmInfo from "./ssm/FrontendSsmInfo";
import FrontendIamInfo from "./iam/FrontendIamInfo";
import CommonIamInfo from "../common_infra/iam/CommonIamInfo";
import CommonLambdaInfo from "../common_infra/lambda/CommonLambdaInfo";

export default class FrontendInfra {
  constructor(
    commonIamInfo: CommonIamInfo,
    commonLambdaInfo: CommonLambdaInfo,
  ) {
    const s3Info = new S3Info();
    const frontendIamInfo = new FrontendIamInfo(commonIamInfo.commonPolicyInfo);
    const frontendCloudfrontInfo = new CloudFrontInfo(s3Info);
    const frontendLambdaInfo = new FrontendLambdaInfo(
      frontendIamInfo,
      s3Info,
      commonLambdaInfo,
    );
    new SnsInfo(frontendLambdaInfo);
    new FrontendSsmInfo(frontendCloudfrontInfo);
  }
}
