import * as https from "https";

function getSlackUrl() {
  return process.env.SLACK_URL;
}

export async function sendSlackMessage(title, message) {
  try {
    const response = await send([title, message]);
    console.log("Send Slack Message successfully:", response);
    return response;
  } catch (error) {
    console.error("Error Send Slack Message:", error);
  }
}

async function send([title, message]) {
  const slackUrl = getSlackUrl();
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