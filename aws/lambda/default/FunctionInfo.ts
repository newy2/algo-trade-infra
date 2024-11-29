import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import SqsInfo from "../../sqs/SqsInfo";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  private readonly frontendDeployFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo, sqsInfo: SqsInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
    this.frontendDeployFunction = this.createFrontendDeployFunction(
      iamInfo,
      sqsInfo,
    );
  }

  public getCleanupEcrImageFunctionArn() {
    return this.cleanupEcrImageFunction?.arn;
  }

  public getFrontendDeployFunctionArn() {
    return this.frontendDeployFunction.arn;
  }

  private createCleanupEcrImageFunction(iamInfo: IamInfo) {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    return new aws.lambda.Function("ecr-cleanup-lambda", {
      name: "cleanup-ecr-image",
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

  private createFrontendDeployFunction(iamInfo: IamInfo, sqsInfo: SqsInfo) {
    const result = new aws.lambda.Function("frontend-deploy-lambda", {
      name: "frontend-deploy",
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getFrontendDeployLambdaRole(),
      handler: "index.handler",
      code: new pulumi.asset.FileArchive(
        "./aws/lambda/default/script/deploy_front_end",
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