import UserData from "./instance/UserData";
import { AppEnv } from "../../../util/enums";

export default class Ec2Info {
  public userData: UserData;

  constructor(appEnv: AppEnv) {
    this.userData = new UserData(appEnv);
  }
}
