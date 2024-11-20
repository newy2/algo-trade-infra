import { InstanceProfile, Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import PolicyInfo from "./PolicyInfo";

export default class RoleInfo {
  private readonly ec2Role: InstanceProfile;
  private readonly eventBridgeEcrPushRuleRole: Role;

  constructor(policyInfo: PolicyInfo) {
    this.ec2Role = this.createEc2Role();
    this.eventBridgeEcrPushRuleRole =
      this.createEventBridgeEcrPushRuleRole(policyInfo);
  }

  public getEventBridgeEcrPushRuleRoleArn() {
    return this.eventBridgeEcrPushRuleRole.arn;
  }

  public getEc2RoleId() {
    return this.ec2Role.id;
  }

  private createEc2Role() {
    const ec2Role = new aws.iam.Role("ec2-role", {
      name: "ec2-role",
      assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
        Service: "ec2.amazonaws.com",
      }),
    });

    new aws.iam.RolePolicyAttachment("managed-instance-policy", {
      role: ec2Role.name,
      policyArn: "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    });

    new aws.iam.RolePolicyAttachment("pull-ecr-repository-policy", {
      role: ec2Role.name,
      policyArn: "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly",
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

    new aws.iam.RolePolicyAttachment("ssmRunCommandPolicyAttachment", {
      role: result.name,
      policyArn: policyInfo.getRunCommandPolicyArn(),
    });

    return result;
  }
}
