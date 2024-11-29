import BaseAwsInfo from "../../BaseAwsInfo";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { Policy } from "@pulumi/aws/iam";
import ParameterStoreInfo from "../../ssm/application_management/ParameterStoreInfo";

export default class PolicyInfo extends BaseAwsInfo {
  private readonly runCommandPolicy: Policy;
  private readonly frontendDeployLambdaCustomPolicy: Policy;

  constructor() {
    super();

    this.runCommandPolicy = this.createRunCommandPolicy();
    this.frontendDeployLambdaCustomPolicy =
      this.createFrontendDeployLambdaCustomPolicy();
  }

  public getRunCommandPolicyArn() {
    return this.runCommandPolicy.arn;
  }

  public getFrontendDeployLambdaCustomPolicyArn() {
    return this.frontendDeployLambdaCustomPolicy.arn;
  }

  private createRunCommandPolicy() {
    return new aws.iam.Policy("ssm-run-command-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "ssm:SendCommand",
            Resource: [
              `arn:aws:ssm:${this.getCurrentRegion()}:*:document/AWS-RunShellScript`,
            ],
          },
          {
            Action: "ssm:SendCommand",
            Effect: "Allow",
            Resource: [
              pulumi.interpolate`arn:aws:ec2:${this.getCurrentRegion()}:${this.getAccountId()}:instance/*`,
            ],
            Condition: {
              StringEquals: {
                "ec2:ResourceTag/*": [this.getEc2ServerName()],
              },
            },
          },
        ],
      },
    });
  }

  private createFrontendDeployLambdaCustomPolicy() {
    return new aws.iam.Policy("frontend-deploy-lambda-custom-policy", {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "ssm:GetParameter",
            Resource: pulumi.interpolate`arn:aws:ssm:${this.getCurrentRegion()}:${this.getAccountId()}:parameter${ParameterStoreInfo.FRONTEND_DISTRIBUTION_ID_KEY}`,
          },
        ],
      },
    });
  }
}