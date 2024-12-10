import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import BaseAwsInfo from "../../../aws/BaseAwsInfo";
import LayerInfo from "../../../common_infra/lambda/additional_resource/LayerInfo";
import * as path from "path";
import IamInfo from "../../iam/IamInfo";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly frontendDeliveryFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo, layerInfo: LayerInfo) {
    super();

    this.frontendDeliveryFunction = this.createFrontendDeliveryFunction(
      iamInfo,
      layerInfo,
    );
  }

  public getFrontendDeliveryFunctionArn() {
    return this.frontendDeliveryFunction.arn;
  }

  private createFrontendDeliveryFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    return new aws.lambda.Function("frontend-delivery-lambda", {
      name: "frontend-delivery",
      description: "프론트엔드 배포 & 롤백",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.frontendRoleInfo.getFrontendDeliveryLambdaRole(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "frontend_delivery"),
      ),
      timeout: 5 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
      environment: {
        variables: {
          BUCKET_NAME: this.getFrontendBucketName(),
        },
      },
    });
  }
}
