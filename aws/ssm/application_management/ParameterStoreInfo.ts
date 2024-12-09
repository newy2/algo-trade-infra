import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import EcrInfo from "../../ecr/EcrInfo";
import { RdsInfo } from "../../rds/RdsInfo";
import VpcInfo from "../../vpc/VpcInfo";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import SqsInfo from "../../sqs/SqsInfo";

export default class ParameterStoreInfo extends BaseAwsInfo {
  public static readonly ECR_PRIVATE_REPOSITORY_URL_KEY = "/ecr/repository/url";
  public static readonly RDS_ENDPOINT_KEY = "/rds/endpoint";
  public static readonly RDS_ADDRESS_KEY = "/rds/address";
  public static readonly RDS_USERNAME_KEY = "/rds/username";
  public static readonly RDS_PASSWORD_KEY = "/rds/password";
  public static readonly RDS_EICE_RDS_CONNECT_ID_KEY =
    "/vpc/eice/rds-connect/id";

  public static readonly CODE_DELIVERY_SLACK_URL_KEY =
    "/code/delivery/slack/url";
  public static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/frontend/cloudfront/distribution/id";
  public static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/frontend/cloudfront/distribution/url";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/backend/cloudfront/distribution/id";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/backend/cloudfront/distribution/url";
  public static readonly CODE_DELIVERY_BACKEND_SQS_COMPLETE_URL_KEY =
    "/code/delivery/backend/sqs/complete/url";

  constructor(
    vpcInfo: VpcInfo,
    ecrInfo: EcrInfo,
    rdsInfo: RdsInfo,
    cloudFrontInfo: CloudFrontInfo,
    sqsInfo: SqsInfo,
  ) {
    super();

    this.setRdsConnectEndpointId(vpcInfo.getRdsConnectEndpointId());
    this.setEcrRepositoryUrl(ecrInfo.getPrivateRepositoryUrl());
    this.setRdsInfo(rdsInfo);
    this.setCodeDeliveryInfo(cloudFrontInfo, sqsInfo);
  }

  private setRdsConnectEndpointId(rdsConnectEndpointId: pulumi.Output<string>) {
    new aws.ssm.Parameter("rds-connect-endpoint-id", {
      name: ParameterStoreInfo.RDS_EICE_RDS_CONNECT_ID_KEY,
      description: "RDS Connect Endpoint Id",
      type: aws.ssm.ParameterType.String,
      value: rdsConnectEndpointId,
    });
  }

  public setEcrRepositoryUrl(repositoryUrl: pulumi.Output<string>) {
    new aws.ssm.Parameter("private-ecr-repository-url", {
      name: ParameterStoreInfo.ECR_PRIVATE_REPOSITORY_URL_KEY,
      description: "ECR private repository URL",
      type: aws.ssm.ParameterType.String,
      value: repositoryUrl,
    });
  }

  public setRdsInfo(rdsInfo: RdsInfo) {
    new aws.ssm.Parameter("rds-endpoint", {
      name: ParameterStoreInfo.RDS_ENDPOINT_KEY,
      description: "RDS Endpoint (with port)",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.getEndpoint(),
    });

    new aws.ssm.Parameter("rds-port", {
      name: ParameterStoreInfo.RDS_ADDRESS_KEY,
      description: "RDS Address (without port)",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.getAddress().apply((it) => it.toString()),
    });

    new aws.ssm.Parameter("rds-username", {
      name: ParameterStoreInfo.RDS_USERNAME_KEY,
      description: "RDS username",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.getUsername(),
    });

    new aws.ssm.Parameter("rds-password", {
      name: ParameterStoreInfo.RDS_PASSWORD_KEY,
      description: "RDS password",
      type: aws.ssm.ParameterType.SecureString,
      value: rdsInfo.getPassword().apply((it) => it!),
    });
  }

  private setCodeDeliveryInfo(
    cloudFrontInfo: CloudFrontInfo,
    sqsInfo: SqsInfo,
  ) {
    new aws.ssm.Parameter("code-delivery-slack-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_SLACK_URL_KEY,
      description: "슬렉 알림 URL",
      type: aws.ssm.ParameterType.String,
      value: this.getSlackUrl(),
    });

    new aws.ssm.Parameter("code-delivery-frontend-cloudfront-distribution-id", {
      name: ParameterStoreInfo.CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY,
      description: "Frontend Distribution ID",
      type: aws.ssm.ParameterType.String,
      value: cloudFrontInfo.getFrontendDistributionId(),
    });

    new aws.ssm.Parameter(
      "code-delivery-frontend-cloudfront-distribution-url",
      {
        name: ParameterStoreInfo.CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY,
        description: "Frontend Distribution URL",
        type: aws.ssm.ParameterType.String,
        value: pulumi.interpolate`https://${cloudFrontInfo.getFrontendDistributionDomainName()}`,
      },
    );

    new aws.ssm.Parameter("code-delivery-backend-cloudfront-distribution-id", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_DISTRIBUTION_ID_KEY,
      description: "Backend Distribution ID",
      type: aws.ssm.ParameterType.String,
      value: cloudFrontInfo.getBackendDistributionId(),
    });

    new aws.ssm.Parameter("code-delivery-backend-cloudfront-distribution-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_DISTRIBUTION_URL_KEY,
      description: "Backend Distribution URL",
      type: aws.ssm.ParameterType.String,
      value: pulumi.interpolate`https://${cloudFrontInfo.getBackendDistributionDomainName()}`,
    });

    new aws.ssm.Parameter("code-delivery-backend-sqs-complete-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SQS_COMPLETE_URL_KEY,
      description: "Backend SQS URL",
      type: aws.ssm.ParameterType.String,
      value: sqsInfo.getBackendDeliveryCompleteQueueUrl(),
    });
  }
}
