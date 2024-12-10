import * as aws from "@pulumi/aws";
import { Repository } from "@pulumi/aws/ecr";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class RepositoryInfo extends BaseAwsInfo {
  private readonly privateRepository: Repository;

  constructor() {
    super();

    this.privateRepository = this.createPrivateRepository();
  }

  public getPrivateRepositoryUrl() {
    return this.privateRepository.repositoryUrl;
  }

  public getPrivateRepositoryName() {
    return this.privateRepository.name;
  }

  private createPrivateRepository() {
    const result = this.createRepository();
    this.setSlowlyCleanupImage(result);
    return result;
  }

  private createRepository() {
    return new aws.ecr.Repository("backend-server-repository", {
      name: this.getEcrPrivateRepositoryName(),
      imageTagMutability: "MUTABLE",
      forceDelete: true,
    });
  }

  private setSlowlyCleanupImage(repository: Repository) {
    if (this.isFastCleanupEcrImage()) {
      return;
    }

    new aws.ecr.LifecyclePolicy("cleanup-ecr-image-policy", {
      repository: repository.name,
      policy: JSON.stringify({
        rules: [
          {
            rulePriority: 1,
            description: "Expire images older than 2 count",
            selection: {
              tagStatus: "any",
              countType: "imageCountMoreThan",
              countNumber: 2,
            },
            action: {
              type: "expire",
            },
          },
        ],
      }),
    });
  }
}
