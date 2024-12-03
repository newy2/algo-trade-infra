import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";

export default class TopicInfo extends BaseAwsInfo {
  private readonly codeDeliveryStateTopic: aws.sns.Topic;

  constructor() {
    super();

    this.codeDeliveryStateTopic = this.createCodeDeliveryStateTopic();
  }

  public getCodeDeliveryStateTopicArn() {
    return this.codeDeliveryStateTopic.arn;
  }

  private createCodeDeliveryStateTopic() {
    const topicName = this.getCodeDeliveryStateSnsTopicName();
    return new aws.sns.Topic(topicName, {
      name: topicName,
    });
  }
}
