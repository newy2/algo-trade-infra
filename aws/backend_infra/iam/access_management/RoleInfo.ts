import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import PolicyInfo from "./PolicyInfo";
import BaseRoleInfo from "../../../../util/BaseRoleInfo";
import CommonPolicyInfo from "../../../common_infra/iam/access_management/CommonPolicyInfo";

export default class RoleInfo extends BaseRoleInfo {
  private readonly ec2InstanceProfile: InstanceProfile;
  private readonly ecrCleanupLambdaRole?: Role;
  public readonly backendDelivery: BackendDeliveryRoleInfo;

  constructor(policyInfo: PolicyInfo, commonPolicyInfo: CommonPolicyInfo) {
    super();

    this.ec2InstanceProfile = this.createEc2InstanceProfile();
    this.ecrCleanupLambdaRole = this.createEcrCleanupLambdaRole();
    this.backendDelivery = new BackendDeliveryRoleInfo(
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
}

class BackendDeliveryRoleInfo extends BaseRoleInfo {
  private readonly scaleUpLambdaRole: Role;
  private readonly verifyInstanceLambdaRole: Role;
  private readonly scaleDownLambdaRole: Role;
  private readonly requestScaleDownQueueMappingLambdaRole: Role;

  constructor(policyInfo: PolicyInfo, commonPolicyInfo: CommonPolicyInfo) {
    super();

    this.scaleUpLambdaRole = this.createScaleUpLambdaRole(
      policyInfo,
      commonPolicyInfo,
    );
    this.verifyInstanceLambdaRole = this.createVerifyInstanceLambdaRole(
      policyInfo,
      commonPolicyInfo,
    );
    this.scaleDownLambdaRole = this.createScaleDownLambdaRole(
      policyInfo,
      commonPolicyInfo,
    );
    this.requestScaleDownQueueMappingLambdaRole =
      this.createRequestScaleDownQueueMappingLambdaRole(
        policyInfo,
        commonPolicyInfo,
      );
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

  private createScaleUpLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
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

  private createVerifyInstanceLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
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
          policyInfo.getBackendDeliveryRequestScaleDownQueueSendMessagePolicyArn(),
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

  private createScaleDownLambdaRole(
    policyInfo: PolicyInfo,
    commonPolicyInfo: CommonPolicyInfo,
  ) {
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
          policyInfo.getBackendDeliveryRequestScaleDownQueuePurgeQueuePolicyArn(),
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

  private createRequestScaleDownQueueMappingLambdaRole(
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
