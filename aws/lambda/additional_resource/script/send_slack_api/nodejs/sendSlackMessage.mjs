import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const snsClient = new SNSClient();

function getTopicArn() {
  return process.env.SNS_TOPIC_ARN;
}

export function sendSlackMessage(title, message) {
  return snsClient.send(new PublishCommand({
    TopicArn: getTopicArn(),
    Subject: title,
    Message: message
  }));
}