import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { validate } from "./util/utils.mjs";

export default class S3 {
  constructor(bucketName) {
    this.s3Client = new S3Client();
    this.bucketName = bucketName;
  }

  async getObjectKeys() {
    return (await this._fetchObjects(this.bucketName)).Contents.map((each) => each.Key);
  }

  async deleteObjects(objectKeys) {
    if (objectKeys.length === 0) {
      return;
    }

    const response = await this.s3Client.send(new DeleteObjectsCommand({
      Bucket: this.bucketName,
      Delete: {
        Objects: objectKeys.map((each) => ({
          Key: each
        }))
      }
    }));
    
    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      },
      {
        key: "responseDeletedLength",
        expected: objectKeys.length,
        actual: response.Deleted.length
      }
    ]);
  }

  async _fetchObjects() {
    return await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.bucketName
    }));
  }
}