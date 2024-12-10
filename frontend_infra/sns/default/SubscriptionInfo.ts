import * as aws from "@pulumi/aws";
import { TopicSubscription } from "@pulumi/aws/sns";
import TopicInfo from "./TopicInfo";
import LambdaInfo from "../../lambda/LambdaInfo";

export default class SubscriptionInfo {
  private readonly frontendRollbackTopicSubscription: TopicSubscription;

  constructor(topicInfo: TopicInfo, lambdaInfo: LambdaInfo) {
    this.frontendRollbackTopicSubscription =
      this.createFrontendRollbackTopicSubscription(topicInfo, lambdaInfo);
  }

  private createFrontendRollbackTopicSubscription(
    topicInfo: TopicInfo,
    lambdaInfo: LambdaInfo,
  ) {
    new aws.lambda.Permission("frontend-rollback-topic-lambda-permission", {
      statementId: "AllowExecutionFromSNS",
      action: "lambda:InvokeFunction",
      principal: "sns.amazonaws.com",
      sourceArn: topicInfo.getCodeDeliveryStateTopicArn(),
      function:
        lambdaInfo.frontendFunctionInfo.getFrontendDeliveryFunctionArn(),
    });

    return new aws.sns.TopicSubscription(
      "frontend-rollback-topic-subscription",
      {
        protocol: "lambda",
        topic: topicInfo.getCodeDeliveryStateTopicArn(),
        endpoint:
          lambdaInfo.frontendFunctionInfo.getFrontendDeliveryFunctionArn(),
      },
    );
  }
}
