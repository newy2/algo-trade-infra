import BucketInfo from "./default/BucketInfo";

export default class S3Info {
  public readonly bucketInfo: BucketInfo;

  constructor() {
    this.bucketInfo = new BucketInfo();
  }
}
