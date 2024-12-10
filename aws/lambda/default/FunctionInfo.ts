import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import LayerInfo from "../additional_resource/LayerInfo";
import * as path from "path";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  private readonly frontendDeliveryFunction: aws.lambda.Function;
  private readonly backendDeliveryEventSourceMapperFunction: aws.lambda.Function;
  private readonly backendDeliveryInitFunction: aws.lambda.Function;
  private readonly backendDeliveryProcessingFunction: aws.lambda.Function;
  private readonly backendDeliveryCompleteFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo, layerInfo: LayerInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
    this.frontendDeliveryFunction = this.createFrontendDeliveryFunction(
      iamInfo,
      layerInfo,
    );

    this.backendDeliveryEventSourceMapperFunction =
      this.createBackendDeliveryEventSourceMapperFunction(iamInfo, layerInfo);
    this.backendDeliveryInitFunction = this.createBackendDeliveryInitFunction(
      iamInfo,
      layerInfo,
    );
    this.backendDeliveryProcessingFunction =
      this.createBackendDeliveryProcessingFunction(iamInfo, layerInfo);
    this.backendDeliveryCompleteFunction =
      this.createBackendDeliveryCompleteFunction(iamInfo, layerInfo);
  }

  public getCleanupEcrImageFunctionArn() {
    return this.cleanupEcrImageFunction?.arn;
  }

  public getFrontendDeliveryFunctionArn() {
    return this.frontendDeliveryFunction.arn;
  }

  public getBackendDeliveryEventSourceMapperFunctionArn() {
    return this.backendDeliveryEventSourceMapperFunction.arn;
  }

  public getBackendDeliveryInitFunctionArn() {
    return this.backendDeliveryInitFunction.arn;
  }

  public getBackendDeliveryProcessingFunctionArn() {
    return this.backendDeliveryProcessingFunction.arn;
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
      role: iamInfo.getEcrCleanupLambdaRoleArn()!,
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

  private createFrontendDeliveryFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const result = new aws.lambda.Function("frontend-delivery-lambda", {
      name: "frontend-delivery",
      description: "프론트엔드 배포 & 롤백",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getFrontendDeliveryLambdaRole(),
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

    return result;
  }

  private createBackendDeliveryInitFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const name = "backend-delivery-init-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 업 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getBackendDeliveryInitRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_init"),
      ),
      timeout: 10,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createBackendDeliveryProcessingFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const name = "backend-delivery-processing-lambda";

    return new aws.lambda.Function(name, {
      name,
      description: "CloudFront 의 Origin 변경",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getBackendDeliveryProcessingRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_processing"),
      ),
      timeout: 10 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createBackendDeliveryCompleteFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const name = this.getBackendDeliveryCompleteLambdaName();

    return new aws.lambda.Function(name, {
      name,
      description: "ASG 인스턴스 사이즈 다운 요청",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getBackendDeliveryCompleteRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_complete"),
      ),
      timeout: 10 * 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });
  }

  private createBackendDeliveryEventSourceMapperFunction(
    iamInfo: IamInfo,
    layerInfo: LayerInfo,
  ) {
    const name = this.getBackendDeliveryEventSourceMapperLambdaName();

    const result = new aws.lambda.Function(name, {
      name,
      description: "백엔드 배포 SQS EventSource 매핑 함수",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getBackendDeliveryEventSourceMapperRoleArn(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        path.join(__dirname, "script", "backend_delivery_event_source_mapping"),
      ),
      timeout: 60,
      layers: [layerInfo.getAwsSdkHelperLayerArn()],
    });

    return result;
  }
}
