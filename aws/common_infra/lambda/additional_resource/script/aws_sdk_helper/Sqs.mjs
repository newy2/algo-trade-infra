import { GetQueueAttributesCommand, PurgeQueueCommand, SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { validate } from "./util/utils.mjs";

export default class Sqs {
  static _SUCCESS_MESSAGE = "success";

  constructor(sqsUrl) {
    this._sqsClient = new SQSClient();
    this._sqsUrl = sqsUrl;
  }

  static isSuccessMessage(message) {
    return Sqs._SUCCESS_MESSAGE === message;
  }

  async sendDelaySuccessMessage() {
    await this._sendMessage(Sqs._SUCCESS_MESSAGE, 5 * 60);
  }

  async sendFailMessage() {
    await this._sendMessage("fail", 0);
  }

  async hasDelayMessage() {
    const result = await this._sqsClient.send(new GetQueueAttributesCommand({
      QueueUrl: this._sqsUrl,
      AttributeNames: ["ApproximateNumberOfMessagesDelayed"]
    }));

    return Number(result.Attributes.ApproximateNumberOfMessagesDelayed) > 0;
  }

  async purgeQueue() {
    const response = await this._sqsClient.send(new PurgeQueueCommand({
      QueueUrl: this._sqsUrl
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
    const response = await this._sqsClient.send(new SendMessageCommand({
      QueueUrl: this._sqsUrl,
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
