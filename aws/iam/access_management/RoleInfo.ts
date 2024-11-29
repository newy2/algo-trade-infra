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
  private readonly frontendDeliveryLambdaRole: Role;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.eventBridgeEcrPushRuleRole =
      this.createEventBridgeEcrPushRuleRole(policyInfo);
    this.lambdaRole = this.createLambdaRole();
    this.frontendDeliveryLambdaRole =
      this.createFrontendDeliveryLambdaRole(policyInfo);
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

  public getFrontendDeliveryLambdaRole() {
    return this.frontendDeliveryLambdaRole.arn;
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

  private createFrontendDeliveryLambdaRole(policyInfo: PolicyInfo) {
    const result = new aws.iam.Role("frontend-delivery-lambda-role", {
      name: "frontend-delivery-lambda-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      { policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole },
      { policyArn: aws.iam.ManagedPolicy.AmazonS3FullAccess },
      { policyArn: aws.iam.ManagedPolicy.CloudFrontFullAccess },
      { policyArn: aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole },
      {
        key: "custom-1",
        policyArn: policyInfo.getFrontendDeliveryLambdaCustomPolicyArn(),
      },
    ].forEach(({ key, policyArn }) => {
      if (key === undefined) {
        key = (policyArn as string).split("/").reverse()[0];
      }

      new aws.iam.RolePolicyAttachment(
        `frontend-delivery-lambda-${key}-policy`,
        {
          policyArn,
          role: result.name,
        },
      );
    });

    return result;
  }
}