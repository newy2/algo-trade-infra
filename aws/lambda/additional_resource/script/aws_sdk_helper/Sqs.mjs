import { GetQueueAttributesCommand, PurgeQueueCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { validate } from "./utils.mjs";

export default class Sqs {
  static SUCCESS_MESSAGE = "success";

  constructor(sqsUrl) {
    this.sqsClient = new SQSClient();
    this.sqsUrl = sqsUrl;
  }

  async sendDelaySuccessMessage() {
    await this._sendMessage(Sqs.SUCCESS_MESSAGE, 5 * 60);
  }

  async sendFailMessage() {
    await this._sendMessage("fail", 0);
  }

  async hasDelayMessage() {
    const result = await this.sqsClient.send(new GetQueueAttributesCommand({
      QueueUrl: this.sqsUrl,
      AttributeNames: ["ApproximateNumberOfMessagesDelayed"]
    }));

    return Number(result.Attributes.ApproximateNumberOfMessagesDelayed) > 0;
  }

  async purgeQueue() {
    const response = await this.sqsClient.send(new PurgeQueueCommand({
      QueueUrl: this.sqsUrl
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async _sendMessage(message, delaySeconds) {
    const response = await this.sqsClient.send(new SendMessageCommand({
      QueueUrl: this.sqsUrl,
      MessageBody: message,
      DelaySeconds: delaySeconds
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }
}
