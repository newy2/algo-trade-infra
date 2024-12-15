import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import AwsConfig from "../../../util/AwsConfig";
import * as path from "path";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class FunctionInfo extends AwsConfig {
  private readonly appEnv: AppEnv;
  private readonly frontendDeliveryFunction: aws.lambda.Function;

  constructor(appEnv: AppEnv, commonInfra: CommonInfra) {
    super();

    this.appEnv = appEnv;
    this.frontendDeliveryFunction =
      this.createFrontendDeliveryFunction(commonInfra);
  }

  public getFrontendDeliveryFunctionArn() {
    return this.frontendDeliveryFunction.arn;
  }

  private createFrontendDeliveryFunction(commonInfra: CommonInfra) {
    const name = genName(this.appEnv, "frontend-delivery");

    return new aws.lambda.Function(genName(name, "lambda"), {
      name,
      description: `[${this.appEnv}] 프론트엔드 배포 & 롤백`,
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.getFrontendDeliveryLambdaRole(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "frontend_delivery"),
      ),
      timeout: 5 * 60,
      layers: [commonInfra.lambdaInfo.layerInfo.getAwsSdkHelperLayerArn()],
      environment: {
        variables: {
          APP_ENV: this.appEnv,
        },
      },
    });
  }
}
