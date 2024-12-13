import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import BaseAwsInfo from "../../../backend_infra/BaseAwsInfo";
import LayerInfo from "../../../common_infra/lambda/additional_resource/LayerInfo";
import * as path from "path";
import IamInfo from "../../../common_infra/iam/IamInfo";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly appEnv: AppEnv;
  private readonly frontendDeliveryFunction: aws.lambda.Function;

  constructor(appEnv: AppEnv, iamInfo: IamInfo, layerInfo: LayerInfo) {
    super();

    this.appEnv = appEnv;
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
    const name = genName(this.appEnv, "frontend-delivery");

    return new aws.lambda.Function(genName(name, "lambda"), {
      name,
      description: `[${this.appEnv}] 프론트엔드 배포 & 롤백`,
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.getFrontendDeliveryLambdaRole(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "frontend_delivery"),
      ),
      timeout: 5 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
      environment: {
        variables: {
          APP_ENV: this.appEnv,
        },
      },
    });
  }
}
