import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import BaseAwsInfo from "../aws/backend_infra/BaseAwsInfo";

type ManagedPolicyArn = string;
type CustomPolicyArn = {
  key: string;
  value: pulumi.Output<string>;
};
type PolicyArn = ManagedPolicyArn | CustomPolicyArn;

export default class BaseRoleInfo extends BaseAwsInfo {
  protected static AssumeRoleKey = {
    EC2: "ec2.amazonaws.com",
    LAMBDA: "lambda.amazonaws.com",
  };

  protected newRolePolicyAttachment(
    prefix: string,
    role: pulumi.Output<string>,
    policyArn: PolicyArn,
  ) {
    new aws.iam.RolePolicyAttachment(
      `${prefix}-${this.getPolicyAttachmentKey(policyArn)}-policy`,
      {
        role,
        policyArn: this.getPolicyArn(policyArn),
      },
    );
  }

  protected getPolicyAttachmentKey(
    policyArn: string | { key: string; value: pulumi.Output<string> },
  ) {
    const isManagedArn = typeof policyArn === "string";
    if (isManagedArn) {
      return policyArn.split("/").reverse()[0];
    }

    return policyArn.key;
  }

  protected getPolicyArn(
    policyArn: string | { key: string; value: pulumi.Output<string> },
  ) {
    const isManagedArn = typeof policyArn === "string";
    if (isManagedArn) {
      return policyArn;
    }

    return policyArn.value;
  }
}
