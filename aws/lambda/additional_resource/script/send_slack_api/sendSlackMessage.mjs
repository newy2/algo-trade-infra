import ApiHelper from "./common/ApiHelper.mjs";

const apiHelper = new ApiHelper();

export async function sendSlackMessage(message) {
  try {
    const slackUrl = getSlackUrl();
    return await apiHelper.call({
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
              "text": message,
              "emoji": true
            }
          }
        ]
      })
    });
  } catch (error) {
    console.error("Error Send Slack Message:", error);
  }
}

function getSlackUrl() {
  return process.env.SLACK_URL;
}