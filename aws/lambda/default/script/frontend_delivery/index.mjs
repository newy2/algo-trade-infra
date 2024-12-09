import { CloudFront, ParameterStore, Slack } from "/opt/nodejs/aws_sdk_helper/index.mjs";

import FrontendDeployModel from "./models/FrontendDeployModel.mjs";
import FrontendRollbackModel from "./models/FrontendRollbackModel.mjs";
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";

export const handler = async (event) => {
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

    await slack.sendMessage("CF 업데이트 요청");
    const isDeployed = await cloudFront.updateFrontendOriginPath(originPath);
    if (!isDeployed) {
      throw new Error("CF 업데이트 실패");
    }
    await slack.sendMessage("CF 업데이트 성공");

    await s3.deleteObjects(deleteObjects);
    await slack.sendMessage([
      "S3 객체 삭제",
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