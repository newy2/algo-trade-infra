import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import PolicyInfo from "./PolicyInfo";
import BaseRoleInfo from "../../../util/BaseRoleInfo";
import CommonPolicyInfo from "../../../common_infra/iam/access_management/CommonPolicyInfo";

export default class RoleInfo extends BaseRoleInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly ecrCleanupLambdaRole?: Role;
  private readonly backendDeliveryInitLambdaRole: Role;
  private readonly backendDeliveryProcessingLambdaRole: Role;
  private readonly backendDeliveryCompleteLambdaRole: Role;
  private readonly backendDeliveryEventSourceMapperLambdaRole: Role;

  constructor(policyInfo: PolicyInfo, commonPolicyInfo: CommonPolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.ecrCleanupLambdaRole = this.createEcrCleanupLambdaRole();
    this.backendDeliveryInitLambdaRole =
      this.createBackendDeliveryInitLambdaRole(policyInfo, commonPolicyInfo);
    this.backendDeliveryProcessingLambdaRole =
      this.createBackendDeliveryProcessingLambdaRole(
        policyInfo,
        commonPolicyInfo,
      );
    this.backendDeliveryCompleteLambdaRole =
      this.createBackendDeliveryCompleteLambdaRole(
        policyInfo,
        commonPolicyInfo,
      );
    this.backendDeliveryEventSourceMapperLambdaRole =
      this.createBackendDeliveryEventSourceMapperLambdaRole(
        policyInfo,
        commonPolicyInfo,
      );
  }

  public getEc2InstanceProfileArn() {
    return this.ec2InstanceProfile.arn;
  }

  public getEcrCleanupLambdaRoleArn() {
    return this.ecrCleanupLambdaRole?.arn;
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

  public getBackendDeliveryEventSourceMapperRoleArn() {
    return this.backendDeliveryEventSourceMapperLambdaRole.arn;
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

  private createBackendDeliveryInitLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
    const prefix = "backend-delivery-init-lambda";
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
        value: policyInfo.getBackedAutoScalingGroupUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: commonPolicyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryProcessingLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
    const prefix = "backend-delivery-processing-lambda";
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
        key: "BackendDeliveryCompleteQueueSendMessage",
        value: policyInfo.getBackendDeliveryCompleteQueueSendMessagePolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupReadPolicy",
        value: policyInfo.getBackedAutoScalingGroupReadPolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: commonPolicyInfo.getCloudFrontUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: commonPolicyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryCompleteLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
    const prefix = "backend-delivery-complete-lambda";
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
        key: "BackendDeliveryCompleteQueuePurgeQueue",
        value: policyInfo.getBackendDeliveryCompleteQueuePurgeQueuePolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupUpdatePolicy",
        value: policyInfo.getBackedAutoScalingGroupUpdatePolicyArn(),
      },
      {
        key: "CloudFrontUpdatePolicy",
        value: commonPolicyInfo.getCloudFrontUpdatePolicyArn(),
      }, // for rollback
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: commonPolicyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }

  private createBackendDeliveryEventSourceMapperLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
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
        value: policyInfo.getChangeLambdaEventSourceMappingPolicyArn(),
      },
      {
        key: "BackedAutoScalingGroupReadPolicy",
        value: policyInfo.getBackedAutoScalingGroupReadPolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreUpdatePolicy",
        value: policyInfo.getCodeDeliveryParameterStoreUpdatePolicyArn(),
      },
      {
        key: "CodeDeliveryParameterStoreReadPolicy",
        value: commonPolicyInfo.getCodeDeliveryParameterStoreReadPolicyArn(),
      },
    ].forEach((each) => {
      this.newRolePolicyAttachment(prefix, result.name, each);
    });

    return result;
  }
}
