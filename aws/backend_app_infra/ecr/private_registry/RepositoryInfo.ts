import * as aws from "@pulumi/aws";
import { Repository } from "@pulumi/aws/ecr";
import AwsConfig from "../../../util/AwsConfig";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class RepositoryInfo extends AwsConfig {
  private readonly appEnv: AppEnv;
  private readonly privateRepository: Repository;

  constructor(appEnv: AppEnv) {
    super();

    this.appEnv = appEnv;
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
    const name = genName(this.appEnv, "backend-server-repository");

    return new aws.ecr.Repository(name, {
      name,
      imageTagMutability: "MUTABLE",
      forceDelete: true,
    });
  }

  private setSlowlyCleanupImage(repository: Repository) {
    if (this.isFastCleanupEcrImage()) {
      return;
    }

    const name = genName(this.appEnv, "cleanup-ecr-image-policy");
    new aws.ecr.LifecyclePolicy(name, {
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
