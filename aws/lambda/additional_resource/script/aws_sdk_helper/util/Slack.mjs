export default class Slack {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  async sendMessage(message) {
    const response = await fetch(this.webhookUrl, {
      method: "POST",
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

    if (response.status !== 200) {
      console.error("Error Send Slack Message(status): ", response.status);
      console.error("Error Send Slack Message(request.body): ", message);
      console.error("Error Send Slack Message(response.body): ", await response.text());
    }
  }
}