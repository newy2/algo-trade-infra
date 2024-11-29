import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import SqsInfo from "../../sqs/SqsInfo";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  private readonly frontendDeliveryFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo, sqsInfo: SqsInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
    this.frontendDeliveryFunction = this.createFrontendDeliveryFunction(
      iamInfo,
      sqsInfo,
    );
  }

  public getCleanupEcrImageFunctionArn() {
    return this.cleanupEcrImageFunction?.arn;
  }

  public getFrontendDeliveryFunctionArn() {
    return this.frontendDeliveryFunction.arn;
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
      role: iamInfo.getLambdaRoleArn()!,
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        "./aws/lambda/default/script/cleanup_ecr_image",
      ),
      timeout: 10,
      environment: {
        variables: { REPOSITORY_NAME: this.getEcrPrivateRepositoryName() },
      },
    });
  }

  private createFrontendDeliveryFunction(iamInfo: IamInfo, sqsInfo: SqsInfo) {
    const result = new aws.lambda.Function("frontend-delivery-lambda", {
      name: "frontend-delivery",
      description: "프론트엔드 배포 & 롤백",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getFrontendDeliveryLambdaRole(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        "./aws/lambda/default/script/frontend_delivery",
      ),
      timeout: 10,
      layers: [this.getAccessParameterStoreLambdaLayerArn()],
      environment: {
        variables: {
          BUCKET_NAME: this.getFrontendBucketName(),
        },
      },
    });

    new aws.lambda.EventSourceMapping("frontend-rollback-queue-mapping", {
      eventSourceArn: sqsInfo.getFrontendRollbackQueueArn(),
      functionName: result.arn,
    });

    return result;
  }
}