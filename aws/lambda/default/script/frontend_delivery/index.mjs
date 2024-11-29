import FrontendDeployModel from "./models/FrontendDeployModel.mjs";
import FrontendRollbackModel from "./models/FrontendRollbackModel.mjs";
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateInvalidationCommand,
  GetDistributionConfigCommand,
  UpdateDistributionCommand
} from "@aws-sdk/client-cloudfront";

export const handler = async (event, context) => {
  const bucketName = getBucketName();
  try {
    const s3 = new S3(bucketName);
    const cloudFront = new CloudFront();

    const [s3ObjectKeys] = await Promise.all([
      s3.getObjectKeys(),
      cloudFront.getDistributionId() // for cache
    ]);

    const model = getModel(s3ObjectKeys, getModelType(event));
    await cloudFront.updateOriginPath(model.getDistributionOriginPath());
    await s3.deleteObjects(model.getDeleteS3ObjectKeys());

    // TODO slack 알림?
  } catch (err) {
    console.error(err);
    throw err;
  }
};

function getBucketName() {
  return process.env.BUCKET_NAME;
}

function getModelType(event) {
  switch (event.Records[0].eventSource) {
    case "aws:s3":
      return "DEPLOY";
    case "aws:sqs":
      return "ROLLBACK";
  }
}

function getModel(s3ObjectKeys, modelType) {
  switch (modelType) {
    case "DEPLOY":
      return new FrontendDeployModel(s3ObjectKeys);
    case "ROLLBACK":
      return new FrontendRollbackModel(s3ObjectKeys);
    default:
      throw new Error(`Not support model type: ${modelType}`);
  }
}

class S3 {
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

    const responseStatusCode = response["$metadata"].httpStatusCode;
    const responseDeletedLength = response.Deleted.length;
    if (responseStatusCode !== 200 || responseDeletedLength !== objectKeys.length) {
      console.error("responseStatusCode", responseStatusCode);
      console.error("responseDeletedLength", responseDeletedLength);
      throw new Error("S3 Bucket Object 를 삭제하지 못했습니다.");
    }
  }

  async _fetchObjects() {
    return await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.bucketName
    }));
  }
}

class CloudFront {
  PARAMETER_STORE_KEY = "/frontend/distribution/id";

  constructor() {
    this.cloudFrontClient = new CloudFrontClient();
  }

  async getDistributionId() {
    return (await this._fetchParameterStore()).Parameter.Value;
  }

  async _fetchParameterStore() {
    const url = `http://localhost:2773/systemsmanager/parameters/get?name=${encodeURIComponent(this.PARAMETER_STORE_KEY)}`;
    const cachedResponse = await fetch(url, {
      headers: {
        "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN
      }
    });
    return cachedResponse.json();
  }

  async updateOriginPath(originPath) {
    await this._updateDistributionOriginPath(originPath);
    await this._sendInvalidationAll();
  }

  async _updateDistributionOriginPath(originPath) {
    const distributionId = await this.getDistributionId();
    const configResponse = await this.cloudFrontClient.send(new GetDistributionConfigCommand({
      Id: distributionId
    }));

    const { DistributionConfig, ETag } = configResponse;
    DistributionConfig.Origins.Items[0].OriginPath = originPath;

    const response = await this.cloudFrontClient.send(new UpdateDistributionCommand({
      DistributionConfig,
      Id: distributionId,
      IfMatch: ETag
    }));

    const responseStatusCode = response["$metadata"].httpStatusCode;
    const responseOriginPath = response.Distribution.DistributionConfig.Origins.Items[0].OriginPath;
    if (responseStatusCode !== 200 || responseOriginPath !== originPath) {
      console.error("responseStatusCode", responseStatusCode);
      console.error("responseOriginPath", responseOriginPath);
      throw new Error("CloudFront OriginPath 를 변경하지 못했습니다.");
    }
  }

  async _sendInvalidationAll() {
    const distributionId = await this.getDistributionId();

    const response = await this.cloudFrontClient.send(new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: ["/*"]
        }
      }
    }));

    const responseStatusCode = response["$metadata"].httpStatusCode;
    const responseInvalidationPath = response.Invalidation.InvalidationBatch.Paths.Items[0];
    if (responseStatusCode !== 201 || responseInvalidationPath !== "/*") {
      console.error("responseStatusCode", responseStatusCode);
      console.error("responseInvalidationPath", responseInvalidationPath);
      throw new Error("CloudFront Invaldation 을 실행하지 못했습니다.");
    }
  }
}