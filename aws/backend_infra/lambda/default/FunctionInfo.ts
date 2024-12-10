import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import IamInfo from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import LayerInfo from "../../../common_infra/lambda/additional_resource/LayerInfo";
import * as path from "path";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  public readonly backendDelivery: BackendDeliveryFunctionInfo;

  constructor(iamInfo: IamInfo, layerInfo: LayerInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
    this.backendDelivery = new BackendDeliveryFunctionInfo(iamInfo, layerInfo);
  }

  public getCleanupEcrImageFunctionArn() {
    return this.cleanupEcrImageFunction?.arn;
  }

  private createCleanupEcrImageFunction(iamInfo: IamInfo) {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    return new aws.lambda.Function("ecr-cleanup-lambda", {
      name: "cleanup-ecr-image",
      description:
        "과거 ECR 이미지 자동 삭제 기능 (Push 이벤트에 실시간으로 반응)",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.getEcrCleanupLambdaRoleArn()!,
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "cleanup_ecr_image"),
      ),
      timeout: 10,
      environment: {
        variables: { REPOSITORY_NAME: this.getEcrPrivateRepositoryName() },
      },
    });
  }
}

class BackendDeliveryFunctionInfo extends BaseAwsInfo {
  private readonly requestScaleDownQueueMappingFunction: aws.lambda.Function;

  private readonly scaleUpFunction: aws.lambda.Function;
  private readonly verifyInstanceFunction: aws.lambda.Function;
  private readonly scaleDownFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo, layerInfo: LayerInfo) {
    super();

    this.requestScaleDownQueueMappingFunction =
      this.createRequestScaleDownQueueMappingFunction(iamInfo, layerInfo);
    this.scaleUpFunction = this.createScaleUpFunction(iamInfo, layerInfo);
    this.verifyInstanceFunction = this.createVerifyInstanceFunction(
      iamInfo,
      layerInfo,
    );
    this.scaleDownFunction = this.createScaleDownFunction(iamInfo, layerInfo);
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

  private createScaleUpFunction(iamInfo: IamInfo, layerInfo: LayerInfo) {
    const name = "backend-delivery-scale-up-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 업 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.backendDelivery.getScaleUpLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_scale_up"),
      ),
      timeout: 10,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createVerifyInstanceFunction(iamInfo: IamInfo, layerInfo: LayerInfo) {
    const name = "backend-delivery-verify-instance-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "CloudFront 의 Origin 변경",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.backendDelivery.getVerifyInstanceLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_verify_instance"),
      ),
      timeout: 10 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createScaleDownFunction(iamInfo: IamInfo, layerInfo: LayerInfo) {
    const name = this.getBackendDeliveryScaleDownLambdaName();

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 다운 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.backendDelivery.getScaleDownLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_scale_down"),
      ),
      timeout: 10 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createRequestScaleDownQueueMappingFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const name =
      this.getBackendDeliveryRequestScaleDownQueueMappingLambdaName();

    const result = new aws.lambda.Function(name, {
      name,
      description: "백엔드 배포 SQS EventSource 매핑 함수",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.roleInfo.backendDelivery.getRequestScaleDownQueueMappingLambdaRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(
          __dirname,
          "script",
          "backend_delivery_request_scale_down_queue_mapping",
        ),
      ),
      timeout: 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });

    return result;
  }
}
