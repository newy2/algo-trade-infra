import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;
  private readonly frontendDeployFunction: aws.lambda.Function;

  constructor(iamInfo: IamInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
    this.frontendDeployFunction = this.createFrontendDeployFunction(iamInfo);
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

  private createFrontendDeployFunction(iamInfo: IamInfo) {
    return new aws.lambda.Function("frontend-deploy-lambda", {
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
          MODEL_TYPE: "DEPLOY",
          BUCKET_NAME: this.getFrontendBucketName(),
        },
      },
    });
  }
}