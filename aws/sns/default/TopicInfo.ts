import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";

export default class TopicInfo extends BaseAwsInfo {
  private readonly frontendRollbackTopic: aws.sns.Topic;

  constructor() {
    super();

    this.frontendRollbackTopic = this.createFrontendRollbackTopic();
  }

  public getCodeDeliveryStateTopicArn() {
    return this.frontendRollbackTopic.arn;
  }

  private createFrontendRollbackTopic() {
    const topicName = "frontend-rollback-topic";
    return new aws.sns.Topic(topicName, {
      name: topicName,
    });
  }
}
