import * as aws from "@pulumi/aws";
import { Repository } from "@pulumi/aws/ecr";

export default class RepositoryInfo {
  private readonly privateRepository: Repository;

  constructor() {
    this.privateRepository = this.createPrivateRepository();
  }

  public getPrivateRepositoryUrl() {
    return this.privateRepository.repositoryUrl;
  }

  public getPrivateRepositoryName() {
    return this.privateRepository.name;
  }

  private createPrivateRepository() {
    return new aws.ecr.Repository("backend-server-repository", {
      name: "backend-server-repository",
      imageTagMutability: "MUTABLE",
      forceDelete: true,
    });
  }
}
