import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import PolicyInfo from "./PolicyInfo";
import BaseAwsInfo from "../../BaseAwsInfo";

enum AssumeRoleKey {
  EC2 = "ec2.amazonaws.com",
  LAMBDA = "lambda.amazonaws.com",
}

export default class RoleInfo extends BaseAwsInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly ecrCleanupLambdaRole?: Role;
  private readonly frontendDeliveryLambdaRole: Role;
  private readonly backendDeliveryInitLambdaRole: Role;
  private readonly backendDeliveryProcessingLambdaRole: Role;
  private readonly backendDeliveryCompleteLambdaRole: Role;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.ecrCleanupLambdaRole = this.createLambdaRole();
    this.frontendDeliveryLambdaRole = this.createFrontendDeliveryLambdaRole();
    this.backendDeliveryInitLambdaRole =
      this.createBackendDeliveryInitLambdaRole(policyInfo);
    this.backendDeliveryProcessingLambdaRole =
      this.createBackendDeliveryProcessingLambdaRole(policyInfo);
    this.backendDeliveryCompleteLambdaRole =
      this.createBackendDeliveryCompleteLambdaRole(policyInfo);
  }

  public getEc2InstanceProfileArn() {
    return this.ec2InstanceProfile.arn;
  }

  public getEcrCleanupLambdaRoleArn() {
    return this.ecrCleanupLambdaRole?.arn;
  }

  public getFrontendDeliveryLambdaRole() {
    return this.frontendDeliveryLambdaRole.arn;
  }

  public getBackendDeliveryInitRoleArn() {
    return this.backendDeliveryInitLambdaRole.arn;
  }

  public getBackendDeliveryProcessingRoleArn() {
    return this.backendDeliveryProcessingLambdaRole.arn;
  }

  public getBackendDeliveryCompleteRoleArn() {
    return this.backendDeliveryCompleteLambdaRole.arn;
  }

  private createEc2InstanceProfile() {
    const prefix = "backend-server-ec2";
    const roleName = `${prefix}-role`;

    const ec2Role = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.EC2,
      }),
    });

    [
      aws.iam.ManagedPolicy.AmazonSSMManagedInstanceCore, // for access parameter store
      aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryReadOnly,
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, ec2Role.name, each);
    });

    return new aws.iam.InstanceProfile(`${prefix}-instance-profile`, {
      role: ec2Role.name,
    });
  }

  private createLambdaRole() {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    const prefix = "ecr-cleanup-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonEC2ContainerRegistryFullAccess,
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createFrontendDeliveryLambdaRole() {
    const prefix = "frontend-delivery-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonS3FullAccess,
      aws.iam.ManagedPolicy.CloudFrontFullAccess,
      aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryInitLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-init-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      {
        key: "BackedAutoScalingGroupUpdatePolicy",
        value: policyInfo.getBackedAutoScalingGroupUpdatePolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryProcessingLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-processing-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      {
        key: "BackendDeliveryCompleteQueueSendMessage",
        value: policyInfo.getBackendDeliveryCompleteQueueSendMessagePolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: policyInfo.getCloudFrontUpdatePolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryCompleteLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-complete-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
      {
        key: "BackendDeliveryCompleteQueuePurgeQueue",
        value: policyInfo.getBackendDeliveryCompleteQueuePurgeQueuePolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: policyInfo.getCloudFrontUpdatePolicyArn(),
      }, // for rollback
      {
        key: "BackedAutoScalingGroupUpdatePolicy",
        value: policyInfo.getBackedAutoScalingGroupUpdatePolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private newRolePolicyAttachment(
    prefix: string,
    role: pulumi.Output<string>,
    policyArn:
      | string
      | {
          key: string;
          value: pulumi.Output<string>;
        },
  ) {
    new aws.iam.RolePolicyAttachment(
      `${prefix}-${this.getPolicyAttachmentKey(policyArn)}-policy`,
      {
        role,
        policyArn: this.getPolicyArn(policyArn),
      },
    );
  }

  private getPolicyAttachmentKey(
    policyArn: string | { key: string; value: pulumi.Output<string> },
  ) {
    const isManagedArn = typeof policyArn === "string";
    if (isManagedArn) {
      return policyArn.split("/").reverse()[0];
    }

    return policyArn.key;
  }

  private getPolicyArn(
    policyArn: string | { key: string; value: pulumi.Output<string> },
  ) {
    const isManagedArn = typeof policyArn === "string";
    if (isManagedArn) {
      return policyArn;
    }

    return policyArn.value;
  }
}
