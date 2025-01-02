import RepositoryInfo from "./private_registry/RepositoryInfo";
import { AppEnv } from "../../util/enums";

export default class EcrInfo {
  public readonly privateRepositoryInfo: RepositoryInfo;

  constructor(appEnv: AppEnv) {
    this.privateRepositoryInfo = new RepositoryInfo(appEnv);
  }
}
