import { LayerVersion } from "@pulumi/aws/lambda";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as path from "path";

export default class LayerInfo {
  private readonly awsSdkHelperLayer: LayerVersion;

  constructor() {
    this.awsSdkHelperLayer = this.createAwsSdkHelper();
  }

  public getAwsSdkHelperLayerArn() {
    return this.awsSdkHelperLayer.arn;
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
