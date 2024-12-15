import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import AwsConfig from "../../../util/AwsConfig";
import * as path from "path";
import BackendAppInfra from "../../../backend_app_infra/BackendAppInfra";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class FunctionInfo extends AwsConfig {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  public readonly backendDelivery: BackendDeliveryFunctionInfo;

  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    super();

    this.cleanupEcrImageFunction =
      this.createCleanupEcrImageFunction(commonInfra);
    this.backendDelivery = new BackendDeliveryFunctionInfo(
      backendAppInfraList,
      commonInfra,
    );
  }

  public getCleanupEcrImageFunctionArn() {
    return this.cleanupEcrImageFunction?.arn;
  }

  private createCleanupEcrImageFunction(commonInfra: CommonInfra) {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    return new aws.lambda.Function("ecr-cleanup-lambda", {
      name: "cleanup-ecr-image",
      description:
        "과거 ECR 이미지 자동 삭제 기능 (Push 이벤트에 실시간으로 반응)",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.getEcrCleanupLambdaRoleArn()!,
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "cleanup_ecr_image"),
      ),
      timeout: 10,
    });
  }
}

class BackendDeliveryFunctionInfo extends AwsConfig {
  private readonly requestScaleDownQueueMappingFunction: aws.lambda.Function;

  private readonly scaleUpFunction: aws.lambda.Function;
  private readonly verifyInstanceFunction: aws.lambda.Function;
  private readonly scaleDownFunction: aws.lambda.Function;

  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    super();

    this.requestScaleDownQueueMappingFunction =
      this.createRequestScaleDownQueueMappingFunction(commonInfra);
    this.scaleUpFunction = this.createScaleUpFunction(commonInfra);
    this.verifyInstanceFunction = this.createVerifyInstanceFunction(
      backendAppInfraList,
      commonInfra,
    );
    this.scaleDownFunction = this.createScaleDownFunction(
      backendAppInfraList,
      commonInfra,
    );
  }

  public getRequestScaleDownQueueMappingFunctionArn() {
    return this.requestScaleDownQueueMappingFunction.arn;
  }

  public getScaleUpFunctionArn() {
    return this.scaleUpFunction.arn;
  }

  public getVerifyInstanceFunctionArn() {
    return this.verifyInstanceFunction.arn;
  }

  private createScaleUpFunction(commonInfra: CommonInfra) {
    const name = "backend-delivery-scale-up-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 업 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.backendDeliveryRoleInfo.getScaleUpLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_scale_up"),
      ),
      timeout: 10,
      layers: [commonInfra.lambdaInfo.layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createVerifyInstanceFunction(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    const name = "backend-delivery-verify-instance-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "CloudFront 의 Origin 변경",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.backendDeliveryRoleInfo.getVerifyInstanceLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_verify_instance"),
      ),
      timeout: 10 * 60,
      layers: [commonInfra.lambdaInfo.layerInfo.getAwsSdkHelperLayerArn()],
      environment: {
        variables: {
          APP_ENV_LIST: backendAppInfraList
            .map((each) => each.appEnv)
            .join(","),
        },
      },
    });
  }

  private createScaleDownFunction(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    const name = this.getBackendDeliveryScaleDownLambdaName();

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 다운 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.backendDeliveryRoleInfo.getScaleDownLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_scale_down"),
      ),
      timeout: 10 * 60,
      layers: [commonInfra.lambdaInfo.layerInfo.getAwsSdkHelperLayerArn()],
      environment: {
        variables: {
          APP_ENV_LIST: backendAppInfraList
            .map((each) => each.appEnv)
            .join(","),
        },
      },
    });
  }

  private createRequestScaleDownQueueMappingFunction(commonInfra: CommonInfra) {
    const name =
      this.getBackendDeliveryRequestScaleDownQueueMappingLambdaName();

    const result = new aws.lambda.Function(name, {
      name,
      description: "백엔드 배포 SQS EventSource 매핑 함수",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: commonInfra.iamInfo.roleInfo.backendDeliveryRoleInfo.getRequestScaleDownQueueMappingLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(
          __dirname,
          "script",
          "backend_delivery_request_scale_down_queue_mapping",
        ),
      ),
      timeout: 60,
      layers: [commonInfra.lambdaInfo.layerInfo.getAwsSdkHelperLayerArn()],
    });

    return result;
  }
}
