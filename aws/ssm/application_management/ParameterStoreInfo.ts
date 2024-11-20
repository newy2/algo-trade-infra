import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import EcrInfo from "../../ecr/EcrInfo";

export default class ParameterStoreInfo {
  constructor(ecrInfo: EcrInfo) {
    this.setEcrRepositoryUrl(ecrInfo.getPrivateRepositoryUrl());
  }

  public setEcrRepositoryUrl(repositoryUrl: pulumi.Output<string>) {
    new aws.ssm.Parameter("private-ecr-repository-url", {
      name: "/ecr/repository/url",
      description: "test",
      type: aws.ssm.ParameterType.String,
      value: repositoryUrl,
    });
  }
}
