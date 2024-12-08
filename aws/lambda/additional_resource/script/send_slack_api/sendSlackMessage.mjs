import ApiHelper from "./common/ApiHelper.mjs";

const apiHelper = new ApiHelper();

export async function sendSlackMessage(title, message) {
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
  } catch (error) {
    console.error("Error Send Slack Message:", error);
  }
}

function getSlackUrl() {
  return process.env.SLACK_URL;
}