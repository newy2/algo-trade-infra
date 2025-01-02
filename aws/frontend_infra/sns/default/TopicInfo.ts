import AwsConfig from "../../../util/AwsConfig";
import * as aws from "@pulumi/aws";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class TopicInfo extends AwsConfig {
  private readonly frontendRollbackTopic: aws.sns.Topic;

  constructor(appEnv: AppEnv) {
    super();

    this.frontendRollbackTopic = this.createFrontendRollbackTopic(appEnv);
  }

  public getCodeDeliveryStateTopicArn() {
    return this.frontendRollbackTopic.arn;
  }

  private createFrontendRollbackTopic(appEnv: AppEnv) {
    const name = genName(appEnv, "frontend-rollback-topic");

    return new aws.sns.Topic(name, {
      name,
    });
  }
}
