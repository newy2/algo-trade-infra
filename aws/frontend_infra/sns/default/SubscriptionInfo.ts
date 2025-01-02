import * as aws from "@pulumi/aws";
import TopicInfo from "./TopicInfo";
import LambdaInfo from "../../lambda/LambdaInfo";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class SubscriptionInfo {
  constructor(appEnv: AppEnv, topicInfo: TopicInfo, lambdaInfo: LambdaInfo) {
    this.createFrontendRollbackTopicSubscription(appEnv, topicInfo, lambdaInfo);
  }

  private createFrontendRollbackTopicSubscription(
    appEnv: AppEnv,
    topicInfo: TopicInfo,
    lambdaInfo: LambdaInfo,
  ) {
    const prefix = genName(appEnv, "frontend-rollback-topic");

    new aws.lambda.Permission(genName(prefix, "lambda-permission"), {
      statementId: "AllowExecutionFromSNS",
      action: "lambda:InvokeFunction",
      principal: "sns.amazonaws.com",
      sourceArn: topicInfo.getCodeDeliveryStateTopicArn(),
      function: lambdaInfo.functionInfo.getFrontendDeliveryFunctionArn(),
    });

    return new aws.sns.TopicSubscription(genName(prefix, "subscription"), {
      protocol: "lambda",
      topic: topicInfo.getCodeDeliveryStateTopicArn(),
      endpoint: lambdaInfo.functionInfo.getFrontendDeliveryFunctionArn(),
    });
  }
}
