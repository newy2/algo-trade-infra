import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { validate } from "./util/utils.mjs";

export default class S3 {
  constructor(bucketName) {
    this._s3Client = new S3Client();
    this._bucketName = bucketName;
  }

  async getObjectKeys() {
    return (await this._fetchObjects(this._bucketName)).Contents.map((each) => each.Key);
  }

  async deleteObjects(objectKeys) {
    if (objectKeys.length === 0) {
      return;
    }

    const response = await this._s3Client.send(new DeleteObjectsCommand({
      Bucket: this._bucketName,
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
    return await this._s3Client.send(new ListObjectsV2Command({
      Bucket: this._bucketName
    }));
  }
}