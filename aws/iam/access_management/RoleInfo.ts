import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import PolicyInfo from "./PolicyInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

enum AssumeRoleKey {
  EC2 = "ec2.amazonaws.com",
  EVENT_BRIDGE = "events.amazonaws.com",
  LAMBDA = "lambda.amazonaws.com",
}

export default class RoleInfo extends BaseAwsInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly eventBridgeEcrPushRuleRole: Role;
  private readonly lambdaRole?: Role;
  private readonly frontendDeployLambdaRole: Role;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.eventBridgeEcrPushRuleRole =
      this.createEventBridgeEcrPushRuleRole(policyInfo);
    this.lambdaRole = this.createLambdaRole();
    this.frontendDeployLambdaRole =
      this.createFrontendDeployLambdaRole(policyInfo);
  }

  public getEventBridgeEcrPushRuleRoleArn() {
    return this.eventBridgeEcrPushRuleRole.arn;
  }

  public getEc2InstanceProfileId() {
    return this.ec2InstanceProfile.id;
  }

  public getEc2InstanceProfileArn() {
    return this.ec2InstanceProfile.arn;
  }

  public getLambdaRoleArn() {
    return this.lambdaRole?.arn;
  }

  public getFrontendDeployLambdaRole() {
    return this.frontendDeployLambdaRole.arn;
  }

  private createEc2InstanceProfile() {
    const ec2Role = new aws.iam.Role("ec2-role", {
      name: "ec2-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.EC2,
      }),
    });

    new aws.iam.RolePolicyAttachment("managed-instance-policy", {
      role: ec2Role.name,
      policyArn: aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore,
    });

    new aws.iam.RolePolicyAttachment("pull-ecr-repository-policy", {
      role: ec2Role.name,
      policyArn: aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryReadOnly,
    });

    return new aws.iam.InstanceProfile("ec2-instance-profile", {
      role: ec2Role.name,
    });
  }

  private createEventBridgeEcrPushRuleRole(policyInfo: PolicyInfo) {
    const result = new aws.iam.Role("event-bridge-ecr-push-rule-role", {
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.EVENT_BRIDGE,
      }),
    });

    new aws.iam.RolePolicyAttachment("ssm-run-command-policy-attachment", {
      role: result.name,
      policyArn: policyInfo.getRunCommandPolicyArn(),
    });

    return result;
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

    new aws.iam.RolePolicyAttachment("lambda-execution-policy", {
      role: result.name,
      policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
    });

    new aws.iam.RolePolicyAttachment("ecr-full-access-policy", {
      role: result.name,
      policyArn: aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryFullAccess,
    });

    return result;
  }

  private createFrontendDeployLambdaRole(policyInfo: PolicyInfo) {
    const result = new aws.iam.Role("frontend-deploy-lambda-role", {
      name: "frontend-deploy-lambda-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonS3FullAccess,
      aws.iam.ManagedPolicy.CloudFrontFullAccess,
      policyInfo.getFrontendDeployLambdaCustomPolicyArn(),
    ].forEach((each, index) => {
      const seq = index + 1;
      new aws.iam.RolePolicyAttachment(`frontend-deploy-lambda-${seq}-policy`, {
        role: result.name,
        policyArn: each,
      });
    });

    return result;
  }
}