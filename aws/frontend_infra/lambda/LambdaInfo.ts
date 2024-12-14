import S3Info from "../s3/S3Info";
import FunctionInfo from "./default/FunctionInfo";
import { AppEnv } from "../../../util/enums";
import CommonInfra from "../../common_infra/CommonInfra";

export default class LambdaInfo {
  public readonly functionInfo: FunctionInfo;

  constructor(appEnv: AppEnv, commonInfra: CommonInfra, s3Info: S3Info) {
    this.functionInfo = new FunctionInfo(appEnv, commonInfra);
    s3Info.bucketInfo.setFrontendBucketNotification(this); // TODO Refector (functionInfo 를 직접 전달할까?)
  }
}
