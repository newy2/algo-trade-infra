import * as aws from "@pulumi/aws";
import { TopicSubscription } from "@pulumi/aws/sns";
import TopicInfo from "./TopicInfo";
import FrontendLambdaInfo from "../../lambda/FrontendLambdaInfo";

export default class SubscriptionInfo {
  private readonly frontendRollbackTopicSubscription: TopicSubscription;

  constructor(topicInfo: TopicInfo, lambdaInfo: FrontendLambdaInfo) {
    this.frontendRollbackTopicSubscription =
      this.createFrontendRollbackTopicSubscription(topicInfo, lambdaInfo);
  }

  private createFrontendRollbackTopicSubscription(
    topicInfo: TopicInfo,
    frontendLambdaInfo: FrontendLambdaInfo,
  ) {
    new aws.lambda.Permission("frontend-rollback-topic-lambda-permission", {
      statementId: "AllowExecutionFromSNS",
      action: "lambda:InvokeFunction",
      principal: "sns.amazonaws.com",
      sourceArn: topicInfo.getCodeDeliveryStateTopicArn(),
      function: frontendLambdaInfo.getFrontendDeliveryFunctionArn(),
    });

    return new aws.sns.TopicSubscription(
      "frontend-rollback-topic-subscription",
      {
        protocol: "lambda",
        topic: topicInfo.getCodeDeliveryStateTopicArn(),
        endpoint: frontendLambdaInfo.getFrontendDeliveryFunctionArn(),
      },
    );
  }
}
