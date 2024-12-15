import AwsConfig from "../../../../util/AwsConfig";
import * as aws from "@pulumi/aws";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";

export default class TopicInfo extends AwsConfig {
  private readonly appEnv: AppEnv;
  private readonly frontendRollbackTopic: aws.sns.Topic;

  constructor(appEnv: AppEnv) {
    super();

    this.appEnv = appEnv;
    this.frontendRollbackTopic = this.createFrontendRollbackTopic();
  }

  public getCodeDeliveryStateTopicArn() {
    return this.frontendRollbackTopic.arn;
  }

  private createFrontendRollbackTopic() {
    const name = genName(this.appEnv, "frontend-rollback-topic");

    return new aws.sns.Topic(name, {
      name,
    });
  }
}
