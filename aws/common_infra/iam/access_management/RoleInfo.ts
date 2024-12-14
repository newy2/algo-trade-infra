import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import BaseRoleInfo from "../../../../util/BaseRoleInfo";
import PolicyInfo from "./PolicyInfo";

export default class RoleInfo extends BaseRoleInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly ecrCleanupLambdaRole?: Role;
  private readonly frontendDeliveryLambdaRole: Role;
  public readonly backendDeliveryRoleInfo: BackendDeliveryRoleInfo;

  constructor(policyInfo: PolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.ecrCleanupLambdaRole = this.createEcrCleanupLambdaRole();
    this.frontendDeliveryLambdaRole =
      this.createFrontendDeliveryLambdaRole(policyInfo);
    this.backendDeliveryRoleInfo = new BackendDeliveryRoleInfo(policyInfo);
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

  private createEc2InstanceProfile() {
    const prefix = "backend-server-ec2";
    const roleName = `${prefix}-role`;

    const ec2Role = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.EC2,
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

  private createEcrCleanupLambdaRole() {
    if (!this.isFastCleanupEcrImage()) {
      return undefined;
    }

    const prefix = "ecr-cleanup-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
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

  private createFrontendDeliveryLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "frontend-delivery-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AmazonS3FullAccess,
      {
        key: "CloudFrontUpdatePolicy",
        value: policyInfo.getCloudFrontUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreAccessPolicy",
        value: policyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }
}

class BackendDeliveryRoleInfo extends BaseRoleInfo {
  private readonly scaleUpLambdaRole: Role;
  private readonly verifyInstanceLambdaRole: Role;
  private readonly scaleDownLambdaRole: Role;
  private readonly requestScaleDownQueueMappingLambdaRole: Role;

  constructor(
    // policyInfo: BackendPolicyInfo,
    commonPolicyInfo: PolicyInfo,
  ) {
    super();

    this.scaleUpLambdaRole = this.createScaleUpLambdaRole(commonPolicyInfo);
    this.verifyInstanceLambdaRole =
      this.createVerifyInstanceLambdaRole(commonPolicyInfo);
    this.scaleDownLambdaRole = this.createScaleDownLambdaRole(commonPolicyInfo);
    this.requestScaleDownQueueMappingLambdaRole =
      this.createRequestScaleDownQueueMappingLambdaRole(commonPolicyInfo);
  }

  public getScaleUpLambdaRoleArn() {
    return this.scaleUpLambdaRole.arn;
  }

  public getVerifyInstanceLambdaRoleArn() {
    return this.verifyInstanceLambdaRole.arn;
  }

  public getScaleDownLambdaRoleArn() {
    return this.scaleDownLambdaRole.arn;
  }

  public getRequestScaleDownQueueMappingLambdaRoleArn() {
    return this.requestScaleDownQueueMappingLambdaRole.arn;
  }

  private createScaleUpLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-scale-up-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      {
        key: "BackedAutoScalingGroupUpdatePolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getAutoScalingGroupUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: policyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createVerifyInstanceLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-verify-instance-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      {
        key: "BackendDeliveryRequestScaleDownQueueSendMessagePolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getRequestScaleDownQueueSendMessagePolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupReadPolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getAutoScalingGroupReadPolicyArn(),
      },
      {
        key: "EcrImageReadPolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getEcrImageReadPolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: policyInfo.getCloudFrontUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: policyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createScaleDownLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-scale-down-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      aws.iam.ManagedPolicy.AWSLambdaSQSQueueExecutionRole,
      {
        key: "BackendDeliveryRequestScaleDownQueuePurgeQueuePolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getRequestScaleDownQueuePurgeQueuePolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupUpdatePolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getAutoScalingGroupUpdatePolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: policyInfo.getCloudFrontUpdatePolicyArn(),
      }, // for rollback
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: policyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createRequestScaleDownQueueMappingLambdaRole(policyInfo: PolicyInfo) {
    const prefix = "backend-delivery-event-source-mapping-lambda";
    const roleName = `${prefix}-role`;

    const result = new aws.iam.Role(roleName, {
      name: roleName,
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: BaseRoleInfo.AssumeRoleKey.LAMBDA,
      }),
    });

    [
      aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
      {
        key: "ChangeLambdaEventSourceMappingPolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getChangeLambdaEventSourceMappingPolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupReadPolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getAutoScalingGroupReadPolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreUpdatePolicy",
        value:
          policyInfo.backendCodeDeliveryPolicyInfo.getParameterStoreUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: policyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }
}
