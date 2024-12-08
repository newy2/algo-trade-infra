import { LayerVersion } from "@pulumi/aws/lambda";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as path from "path";

export default class LayerInfo {
  private readonly sendSlackApiLayer: LayerVersion;
  private readonly awsSdkHelperLayer: LayerVersion;

  constructor() {
    this.sendSlackApiLayer = this.createSendSlackApiLayer();
    this.awsSdkHelperLayer = this.createAwsSdkHelper();
  }

  public getSendSlackApiLayerArn() {
    return this.sendSlackApiLayer.arn;
  }

  public getAwsSdkHelperLayerArn() {
    return this.awsSdkHelperLayer.arn;
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

  private createAwsSdkHelper() {
    const layerName = "aws-sdk-helper";
    const folderName = "aws_sdk_helper";

    return new aws.lambda.LayerVersion(layerName, {
      layerName,
      description: "AWS SDK 헬퍼 로직",
      compatibleRuntimes: [aws.lambda.Runtime.NodeJS20dX],
      code: new pulumi.asset.AssetArchive({
        nodejs: new pulumi.asset.AssetArchive({
          [folderName]: new pulumi.asset.FileArchive(
            path.join(__dirname, "script", folderName),
          ),
        }),
      }),
    });
  }
}
