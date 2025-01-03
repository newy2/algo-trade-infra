import * as aws from "@pulumi/aws";
import { RdsInfo } from "../../rds/RdsInfo";
import AwsConfig from "../../../util/AwsConfig";
import SqsInfo from "../../sqs/SqsInfo";

export default class ParameterStoreInfo extends AwsConfig {
  public static readonly RDS_ENDPOINT_KEY = "/rds/endpoint";
  public static readonly RDS_ADDRESS_KEY = "/rds/address";
  public static readonly RDS_USERNAME_KEY = "/rds/username";
  public static readonly RDS_PASSWORD_KEY = "/rds/password";

  public static readonly CODE_DELIVERY_SLACK_URL_KEY =
    "/code/delivery/slack/url";
  public static readonly CODE_DELIVERY_BACKEND_SQS_REQUEST_SCALE_DOWN_ARN_KEY =
    "/code/delivery/backend/sqs/request_scale_down/arn";
  public static readonly CODE_DELIVERY_BACKEND_SQS_REQUEST_SCALE_DOWN_URL_KEY =
    "/code/delivery/backend/sqs/request_scale_down/url";
  public static readonly CODE_DELIVERY_BACKEND_AUTO_SCALING_GROUP_NAME_KEY =
    "/code/delivery/backend/auto_scaling_group/name";
  public static readonly CODE_DELIVERY_BACKEND_SCALE_DOWN_LAMBDA_NAME_KEY =
    "/code/delivery/backend/lambda/scale_down/name";
  public static readonly CODE_DELIVERY_BACKEND_SCALE_DOWN_LAMBDA_EVENT_SOURCE_UUID_NAME_KEY =
    "/code/delivery/backend/lambda/scale_down/event_source/uuid";

  constructor(rdsInfo: RdsInfo, sqsInfo: SqsInfo) {
    super();

    this.setRdsInfo(rdsInfo);
    this.setCodeDeliveryInfo(sqsInfo);
  }

  public setRdsInfo(rdsInfo: RdsInfo) {
    new aws.ssm.Parameter("rds-endpoint", {
      name: ParameterStoreInfo.RDS_ENDPOINT_KEY,
      description: "RDS Endpoint (with port)",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.instanceInfo.getEndpoint(),
    });

    new aws.ssm.Parameter("rds-port", {
      name: ParameterStoreInfo.RDS_ADDRESS_KEY,
      description: "RDS Address (without port)",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.instanceInfo.getAddress().apply((it) => it.toString()),
    });

    new aws.ssm.Parameter("rds-username", {
      name: ParameterStoreInfo.RDS_USERNAME_KEY,
      description: "RDS username",
      type: aws.ssm.ParameterType.String,
      value: rdsInfo.instanceInfo.getUsername(),
    });

    new aws.ssm.Parameter("rds-password", {
      name: ParameterStoreInfo.RDS_PASSWORD_KEY,
      description: "RDS password",
      type: aws.ssm.ParameterType.SecureString,
      value: rdsInfo.instanceInfo.getPassword().apply((it) => it!),
    });
  }

  private setCodeDeliveryInfo(sqsInfo: SqsInfo) {
    new aws.ssm.Parameter("code-delivery-slack-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_SLACK_URL_KEY,
      description: "슬렉 알림 URL",
      type: aws.ssm.ParameterType.String,
      value: this.getSlackUrl(),
    });

    new aws.ssm.Parameter("code-delivery-backend-sqs-request-scale-down-arn", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SQS_REQUEST_SCALE_DOWN_ARN_KEY,
      description: "Backend SQS ARN",
      type: aws.ssm.ParameterType.String,
      value: sqsInfo.queueInfo.getBackendDeliveryRequestScaleDownQueueArn(),
    });

    new aws.ssm.Parameter("code-delivery-backend-sqs-request-scale-down-url", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SQS_REQUEST_SCALE_DOWN_URL_KEY,
      description: "Backend SQS URL",
      type: aws.ssm.ParameterType.String,
      value: sqsInfo.queueInfo.getBackendDeliveryRequestScaleDownQueueUrl(),
    });

    new aws.ssm.Parameter("code-delivery-backend-auto-scaling-group-name", {
      name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_AUTO_SCALING_GROUP_NAME_KEY,
      description: "Backend ASG name",
      type: aws.ssm.ParameterType.String,
      value: this.getBackendServerAutoScalingGroupName(),
    });

    new aws.ssm.Parameter(
      "code-delivery-backend-delivery-scale-down-lambda-name",
      {
        name: ParameterStoreInfo.CODE_DELIVERY_BACKEND_SCALE_DOWN_LAMBDA_NAME_KEY,
        description: "Backend Delivery Scale Down Lambda name",
        type: aws.ssm.ParameterType.String,
        value: this.getBackendDeliveryScaleDownLambdaName(),
      },
    );
  }
}
