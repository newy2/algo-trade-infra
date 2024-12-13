import BucketInfo from "./default/BucketInfo";
import { AppEnv } from "../../../util/enums";

export default class S3Info {
  public readonly bucketInfo: BucketInfo;

  constructor(appEnv: AppEnv) {
    this.bucketInfo = new BucketInfo(appEnv);
  }
}
