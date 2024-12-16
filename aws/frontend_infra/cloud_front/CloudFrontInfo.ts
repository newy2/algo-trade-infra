import OriginAccessInfo from "./security/OriginAccessInfo";
import S3Info from "../s3/S3Info";
import DistributionInfo from "./default/DistributionInfo";
import FunctionInfo from "./default/FunctionInfo";
import { AppEnv } from "../../util/enums";

export default class CloudFrontInfo {
  public readonly distributionInfo: DistributionInfo;

  constructor(appEnv: AppEnv, s3Info: S3Info) {
    const functionInfo = new FunctionInfo(appEnv);
    const originAccessInfo = new OriginAccessInfo(appEnv, s3Info);
    this.distributionInfo = new DistributionInfo(
      appEnv,
      s3Info,
      functionInfo,
      originAccessInfo,
    );
    s3Info.bucketInfo.setFrontendBucketPolicy(this);
  }
}
