import { CloudFront, ParameterStore, S3, Slack } from "/opt/nodejs/aws_sdk_helper/index.mjs";

import FrontendDeployModel from "./models/FrontendDeployModel.mjs";
import FrontendRollbackModel from "./models/FrontendRollbackModel.mjs";

export const handler = async (event) => {
  const parameterStore = new ParameterStore(process.env.APP_ENV);
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
  }
};

function getModelType(event) {
  const firstRecord = event.Records[0];
  switch (firstRecord.eventSource || firstRecord.EventSource) {
    case "aws:s3": // => firstRecord.eventSource
      return "DEPLOY";
    case "aws:sns": // => firstRecord.EventSource
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