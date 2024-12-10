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
  public static readonly CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY =
    "/code/delivery/frontend/s3/bucket/name";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/backend/cloudfront/distribution/id";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/backend/cloudfront/distribution/url";
  public static readonly CODE_DELIVERY_BACKEND_SQS_COMPLETE_ARN_KEY =
    "/code/delivery/backend/sqs/complete/arn";
  public static readonly CODE_DELIVERY_BACKEND_SQS_COMPLETE_URL_KEY =
    "/code/delivery/backend/sqs/complete/url";
  public static readonly CODE_DELIVERY_BACKEND_AUTO_SCALING_GROUP_NAME_KEY =
    "/code/delivery/backend/auto_scaling_group/name";
  public static readonly CODE_DELIVERY_BACKEND_DELIVERY_COMPLETE_LAMBDA_NAME_KEY =
    "/code/delivery/backend/delivery_complete_lambda/name";
  public static readonly CODE_DELIVERY_BACKEND_DELIVERY_COMPLETE_LAMBDA_EVENT_SOURCE_UUID_NAME_KEY =
    "/code/delivery/backend/delivery_complete_lambda/event_source/uuid";

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

    new aws.ssm.Parameter("code-delivery-frontend-bucket-name", {
      name: ParameterStoreInfo.CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY,
      description: "Frontend S3 Bucket name",
      type: aws.ssm.ParameterType.String,
      value: this.getFrontendBucketName(),
    });

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

    new aws.ssm.Parameter("code-delivery-backend-sqs-complete-arn", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SQS_COMPLETE_ARN_KEY,
      description: "Backend SQS ARN",
      type: aws.ssm.ParameterType.String,
      value: sqsInfo.getBackendDeliveryCompleteQueueArn(),
    });

    new aws.ssm.Parameter("code-delivery-backend-sqs-complete-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SQS_COMPLETE_URL_KEY,
      description: "Backend SQS URL",
      type: aws.ssm.ParameterType.String,
      value: sqsInfo.getBackendDeliveryCompleteQueueUrl(),
    });

    new aws.ssm.Parameter("code-delivery-backend-auto-scaling-group-name", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_AUTO_SCALING_GROUP_NAME_KEY,
      description: "Backend ASG name",
      type: aws.ssm.ParameterType.String,
      value: this.getBackendServerAutoScalingGroupName(),
    });

    new aws.ssm.Parameter(
      "code-delivery-backend-delivery-complete-lambda-name",
      {
        name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_DELIVERY_COMPLETE_LAMBDA_NAME_KEY,
        description: "Backend Delivery Complete Lambda name",
        type: aws.ssm.ParameterType.String,
        value: this.getBackendDeliveryCompleteLambdaName(),
      },
    );
  }
}
