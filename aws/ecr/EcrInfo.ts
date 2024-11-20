import RepositoryInfo from "./private_registry/RepositoryInfo";

export default class EcrInfo {
  private readonly privateRepositoryInfo: RepositoryInfo;

  constructor() {
    this.privateRepositoryInfo = new RepositoryInfo();
  }

  public getPrivateRepositoryUrl() {
    return this.privateRepositoryInfo.getPrivateRepositoryUrl();
  }

  public getPrivateRepositoryName() {
    return this.privateRepositoryInfo.getPrivateRepositoryName();
  }
}
