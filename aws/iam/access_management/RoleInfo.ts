import { Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import PolicyInfo from "./PolicyInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

enum AssumeRoleKey {
  EC2 = "ec2.amazonaws.com",
  LAMBDA = "lambda.amazonaws.com",
}

export default class RoleInfo extends BaseAwsInfo {
  private readonly lambdaRole?: Role;
  private readonly frontendDeliveryLambdaRole: Role;
  private readonly sendSlackMessageLambdaRole: Role;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.lambdaRole = this.createLambdaRole();
    this.frontendDeliveryLambdaRole =
      this.createFrontendDeliveryLambdaRole(policyInfo);
    this.sendSlackMessageLambdaRole = this.createSendSlackMessageLambdaRole();
  }

  public getLambdaRoleArn() {
    return this.lambdaRole?.arn;
  }

  public getFrontendDeliveryLambdaRole() {
    return this.frontendDeliveryLambdaRole.arn;
  }

  public getSendSlackMessageLambdaRole() {
    return this.sendSlackMessageLambdaRole.arn;
  }

  private createLambdaRole() {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    const result = new aws.iam.Role("lambda-role", {
      name: "lambda-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryFullAccess,
    ].forEach((eachPolicyArn, index) => {
      new aws.iam.RolePolicyAttachment(
        `lambda-role-${this.getPolicyAttachmentKey(eachPolicyArn, index)}-policy`,
        {
          role: result.name,
          policyArn: eachPolicyArn,
        },
      );
    });

    return result;
  }

  private createFrontendDeliveryLambdaRole(policyInfo: PolicyInfo) {
    const result = new aws.iam.Role("frontend-delivery-lambda-role", {
      name: "frontend-delivery-lambda-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonS3FullAccess,
      aws.iam.ManagedPolicy.CloudFrontFullAccess,
      aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
      policyInfo.getCodeDeliveryStateSnsPublishMessagePolicy(),
    ].forEach((eachPolicyArn, index) => {
      new aws.iam.RolePolicyAttachment(
        `frontend-delivery-lambda-${this.getPolicyAttachmentKey(eachPolicyArn, index)}-policy`,
        {
          policyArn: eachPolicyArn,
          role: result.name,
        },
      );
    });

    return result;
  }

  private createSendSlackMessageLambdaRole() {
    const prefix = "send-slack-message-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole].forEach(
      (eachPolicyArn, index) => {
        new aws.iam.RolePolicyAttachment(
          `${prefix}-${this.getPolicyAttachmentKey(eachPolicyArn, index)}-policy`,
          {
            policyArn: eachPolicyArn,
            role: result.name,
          },
        );
      },
    );

    return result;
  }

  private getPolicyAttachmentKey(
    policyArn: string | pulumi.Output<string>,
    index: number,
  ) {
    if (typeof policyArn === "string") {
      return policyArn.split("/").reverse()[0];
    }

    const seq = index + 1;
    return `custom-${seq}`;
  }
}
