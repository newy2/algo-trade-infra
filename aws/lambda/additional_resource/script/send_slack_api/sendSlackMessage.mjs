import ApiHelper from "./common/ApiHelper.mjs";

const apiHelper = new ApiHelper();

export async function sendSlackMessage(message) {
  try {
    const slackUrl = getSlackUrl();
    const response = await apiHelper.call({
      method: "POST",
      url: slackUrl,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": message
            }
          }
        ]
      })
    });

    if (response.statusCode !== 200) {
      console.error("Error Send Slack Message(response.statusCode): ", response.statusCode);
      console.error("Error Send Slack Message(response.body): ", response.body);
      console.error("Error Send Slack Message(message): ", message);
    }
  } catch (error) {
    console.error("Error Send Slack Message(message): ", message);
  }
}

function getSlackUrl() {
  return process.env.SLACK_URL;
}