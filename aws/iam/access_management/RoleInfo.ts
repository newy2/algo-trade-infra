import { InstanceProfile } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";

export default class RoleInfo {
  private readonly ec2Role: InstanceProfile;

  constructor() {
    this.ec2Role = this.createEc2Role();
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
}
