import { LayerVersion } from "@pulumi/aws/lambda";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export default class LayerInfo {
  private readonly sendSlackApiLayer: LayerVersion;

  constructor() {
    this.sendSlackApiLayer = this.createSendSlackApiLayer();
  }

  public getSendSlackApiLayer() {
    return this.sendSlackApiLayer.arn;
  }

  private createSendSlackApiLayer() {
    const layerName = "send-slack-api-layer";

    return new aws.lambda.LayerVersion(layerName, {
      layerName,
      description: "Slack API 호출 로직",
      compatibleRuntimes: [aws.lambda.Runtime.NodeJS20dX],
      code: new pulumi.asset.FileArchive(
        "./aws/lambda/additional_resource/script/send_slack_api",
      ),
    });
  }
}
