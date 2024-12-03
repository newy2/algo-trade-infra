import * as https from "https";

export const handler = async (event) => {
  try {
    const response = await sendSlackMessage(parseMessage(event));
    console.log("Send Slack Message successfully:", response);
    return response;
  } catch (error) {
    console.error("Error Send Slack Message:", error);
  }
};

function parseMessage(event) {
  const firstRecord = event.Records[0];
  const eventSource = firstRecord.EventSource || firstRecord.eventSource;

  switch (eventSource) {
    case "aws:sns":
      return [firstRecord.Sns.Subject, firstRecord.Sns.Message /** firstRecord.Sns.Timestamp */];
    case "aws:sqs":
      return [firstRecord.body, firstRecord.body];
    default:
      throw Error(`Not Support EventSource (value: ${eventSource})`);
  }
}

async function sendSlackMessage([title, message]) {
  const slackUrl = process.env.SLACK_URL;
  return httpsPost({
    url: slackUrl,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "blocks": [
        {
          "type": "header",
          "text": {
            "type": "plain_text",
            "text": title,
            "emoji": true
          }
        },
        {
          "type": "section",
          "text": {
            "type": "plain_text",
            "text": message,
            "emoji": true
          }
        }
      ]
    })
  });
}

function httpsPost({ url, body, ...options }) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: "POST",
      ...options
    }, res => {
      const chunks = [];
      res.on("data", data => chunks.push(data));
      res.on("end", () => {
        const resBody = Buffer.concat(chunks);
        switch (res.headers["content-type"]) {
          case "application/json":
            resolve(JSON.parse(resBody));
            break;
          default:
            resolve(resBody.toString());
            break;
        }
      });
    });
    req.on("error", reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}