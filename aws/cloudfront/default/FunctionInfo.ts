import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

export default class FunctionInfo {
  private readonly generateRedirectUrlFunction: aws.cloudfront.Function;

  constructor() {
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

    const name = "generate-redirect-url";
    return new aws.cloudfront.Function(`${name}-function`, {
      name,
      runtime: "cloudfront-js-2.0",
      code: functionCode,
    });
  }
}
