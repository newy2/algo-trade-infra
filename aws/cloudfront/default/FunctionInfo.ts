import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as path from "path";

export default class FunctionInfo {
  private readonly functionForFrontEndRouter: aws.cloudfront.Function;

  constructor() {
    this.functionForFrontEndRouter = this.createFunctionForFrontEndRouter();
  }

  public getGenerateRedirectUriFunctionArn() {
    return this.functionForFrontEndRouter.arn;
  }

  private createFunctionForFrontEndRouter() {
    const functionCode = fs.readFileSync(
      path.join(__dirname, "script", "generate_redirect_uri.js"),
      "utf8",
    );

    return new aws.cloudfront.Function("generate-redirect-uri-function", {
      name: "generate_redirect_uri",
      runtime: "cloudfront-js-2.0",
      code: functionCode,
    });
  }
}
