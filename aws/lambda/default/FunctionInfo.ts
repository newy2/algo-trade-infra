import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { IamInfo } from "../../iam/IamInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class FunctionInfo extends BaseAwsInfo {
  private readonly cleanupEcrImageFunction?: aws.lambda.Function;

  constructor(iamInfo: IamInfo) {
    super();

    this.cleanupEcrImageFunction = this.createCleanupEcrImageFunction(iamInfo);
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
      runtime: aws.lambda.Runtime.NodeJS20dX,
      role: iamInfo.getLambdaRoleArn()!,
      handler: "cleanup_ecr_image.handler",
      code: new pulumi.asset.FileArchive("./aws/lambda/default/script"),
      timeout: 10,
      environment: {
        variables: { REPOSITORY_NAME: this.getEcrPrivateRepositoryName() },
      },
    });
  }
}
