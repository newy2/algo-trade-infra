import { Role } from "@pulumi/aws/iam";
import * as aws from "@pulumi/aws";
import BaseRoleInfo from "../../../util/BaseRoleInfo";
import CommonPolicyInfo from "../../../common_infra/iam/access_management/CommonPolicyInfo";

export default class FrontendRoleInfo extends BaseRoleInfo {
  private readonly frontendDeliveryLambdaRole: Role;

  constructor(commonPolicyInfo: CommonPolicyInfo) {
    super();

    this.frontendDeliveryLambdaRole =
      this.createFrontendDeliveryLambdaRole(commonPolicyInfo);
  }

  public getFrontendDeliveryLambdaRole() {
    return this.frontendDeliveryLambdaRole.arn;
  }

  private createFrontendDeliveryLambdaRole(policyInfo: CommonPolicyInfo) {
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
