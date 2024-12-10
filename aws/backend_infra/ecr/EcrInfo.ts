import RepositoryInfo from "./private_registry/RepositoryInfo";

export default class EcrInfo {
  public readonly privateRepositoryInfo: RepositoryInfo;

  constructor() {
    this.privateRepositoryInfo = new RepositoryInfo();
  }
}
