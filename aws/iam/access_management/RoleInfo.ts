import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import PolicyInfo from "./PolicyInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

export default class RoleInfo extends BaseAwsInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly eventBridgeEcrPushRuleRole: Role;
  private readonly lambdaRole?: Role;
  private readonly codeDeployRole: Role;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.eventBridgeEcrPushRuleRole =
      this.createEventBridgeEcrPushRuleRole(policyInfo);
    this.lambdaRole = this.createLambdaRole();
    this.codeDeployRole = this.createCodeDeployRole();
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

  private createEc2InstanceProfile() {
    const ec2Role = new aws.iam.Role("ec2-role", {
      name: "ec2-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "ec2.amazonaws.com",
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
        Service: "events.amazonaws.com",
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
        Service: "lambda.amazonaws.com",
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
}
