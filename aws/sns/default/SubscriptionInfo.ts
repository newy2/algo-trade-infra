import * as aws from "@pulumi/aws";
import { TopicSubscription } from "@pulumi/aws/sns";
import TopicInfo from "./TopicInfo";
import LambdaInfo from "../../lambda/LambdaInfo";

export default class SubscriptionInfo {
  private readonly codeDeliveryStateTopicSubscription: TopicSubscription;

  constructor(topicInfo: TopicInfo, lambdaInfo: LambdaInfo) {
    this.codeDeliveryStateTopicSubscription =
      this.createCodeDeliveryStateTopicSubscription(topicInfo, lambdaInfo);
  }

  private createCodeDeliveryStateTopicSubscription(
    topicInfo: TopicInfo,
    lambdaInfo: LambdaInfo,
  ) {
    new aws.lambda.Permission("send-slack-message-lambda-permission", {
      statementId: "AllowExecutionFromSNS",
      action: "lambda:InvokeFunction",
      function: lambdaInfo.getSendSlackMessageFunctionName(),
      principal: "sns.amazonaws.com",
      sourceArn: topicInfo.getCodeDeliveryStateTopicArn(),
    });

    return new aws.sns.TopicSubscription(
      "code-delivery-state-topic-subscription",
      {
        protocol: "lambda",
        topic: topicInfo.getCodeDeliveryStateTopicArn(),
        endpoint: lambdaInfo.getSendSlackMessageFunctionArn(),
      },
    );
  }
}
