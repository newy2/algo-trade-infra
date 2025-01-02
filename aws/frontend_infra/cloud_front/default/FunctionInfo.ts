import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class FunctionInfo {
  private readonly generateRedirectUrlFunction: aws.cloudfront.Function;

  constructor(appEnv: AppEnv) {
    this.generateRedirectUrlFunction =
      this.createGenerateRedirectUrlFunction(appEnv);
  }

  public getGenerateRedirectUrlFunctionArn() {
    return this.generateRedirectUrlFunction.arn;
  }

  private createGenerateRedirectUrlFunction(appEnv: AppEnv) {
    const functionCode = fs.readFileSync(
      path.join(__dirname, "script", "generateRedirectUrl.mjs"),
      "utf8",
    );

    const name = genName(appEnv, "generate-redirect-url");
    return new aws.cloudfront.Function(`${name}-function`, {
      name,
      runtime: "cloudfront-js-2.0",
      code: functionCode,
    });
  }
}
