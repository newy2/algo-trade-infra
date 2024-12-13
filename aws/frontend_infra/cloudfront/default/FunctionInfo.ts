import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";

export default class FunctionInfo {
  private readonly appEnv: AppEnv;
  private readonly generateRedirectUrlFunction: aws.cloudfront.Function;

  constructor(appEnv: AppEnv) {
    this.appEnv = appEnv;
    this.generateRedirectUrlFunction = this.createGenerateRedirectUrlFunction();
  }

  public getGenerateRedirectUrlFunctionArn() {
    return this.generateRedirectUrlFunction.arn;
  }

  private createGenerateRedirectUrlFunction() {
    const functionCode = fs.readFileSync(
      path.join(__dirname, "script", "generateRedirectUrl.mjs"),
      "utf8",
    );

    const name = genName(this.appEnv, "generate-redirect-url");
    return new aws.cloudfront.Function(`${name}-function`, {
      name,
      runtime: "cloudfront-js-2.0",
      code: functionCode,
    });
  }
}
