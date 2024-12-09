import { ParameterStore, Slack } from "/opt/nodejs/aws_sdk_helper/index.mjs";

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
  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    await slack.sendMessage("프론트엔드 배포시작");
    const s3 = new S3(await parameterStore.getFrontendBucketName());
    const cloudFront = new CloudFront(await parameterStore.getFrontendDistributionId());

    const s3ObjectKeys = await s3.getObjectKeys();
    const model = getModel(s3ObjectKeys, getModelType(event));
    const originPath = model.getDistributionOriginPath();
    const deleteObjects = model.getDeleteS3ObjectKeys();

    await cloudFront.updateOriginPath(originPath);
    await s3.deleteObjects(deleteObjects);

    await slack.sendMessage([
      "프론트엔드 배포 종료",
      `originPath: ${originPath}`,
      `deleteObjects: ${deleteObjects.join("\n")}`
    ].join("\n"));
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[frontend_delivery] 에러발생\n${error}`);
    throw error;
  }
};

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
  constructor(distributionId) {
    this.cloudFrontClient = new CloudFrontClient();
    this.distributionId = distributionId;
  }

  getDistributionId() {
    return this.distributionId;
  }

  async updateOriginPath(originPath) {
    await this._updateDistributionOriginPath(originPath);
    await this._sendInvalidationAll();
  }

  async _updateDistributionOriginPath(originPath) {
    const distributionId = this.getDistributionId();
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
    const distributionId = this.getDistributionId();

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