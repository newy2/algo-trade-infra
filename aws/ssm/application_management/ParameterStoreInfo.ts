import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import EcrInfo from "../../ecr/EcrInfo";

export default class ParameterStoreInfo {
  public static readonly ECR_PRIVATE_REPOSITORY_URL_KEY = "/ecr/repository/url";

  constructor(ecrInfo: EcrInfo) {
    this.setEcrRepositoryUrl(ecrInfo.getPrivateRepositoryUrl());
  }

  public setEcrRepositoryUrl(repositoryUrl: pulumi.Output<string>) {
    new aws.ssm.Parameter("private-ecr-repository-url", {
      name: ParameterStoreInfo.ECR_PRIVATE_REPOSITORY_URL_KEY,
      description: "ECR private repository URL",
      type: aws.ssm.ParameterType.String,
      value: repositoryUrl,
    });
  }
}
