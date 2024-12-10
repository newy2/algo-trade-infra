import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import BaseAwsInfo from "../../../aws/BaseAwsInfo";
import FrontendCloudFrontInfo from "../../cloudfront/FrontendCloudFrontInfo";

export default class FrontendParameterStoreInfo extends BaseAwsInfo {
  public static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/frontend/cloudfront/distribution/id";
  public static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/frontend/cloudfront/distribution/url";
  public static readonly CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY =
    "/code/delivery/frontend/s3/bucket/name";

  constructor(frontendCloudFrontInfo: FrontendCloudFrontInfo) {
    super();

    this.setCodeDeliveryInfo(frontendCloudFrontInfo);
  }

  private setCodeDeliveryInfo(frontendCloudFrontInfo: FrontendCloudFrontInfo) {
    new aws.ssm.Parameter("code-delivery-frontend-cloudfront-distribution-id", {
      name: FrontendParameterStoreInfo.CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY,
      description: "Frontend Distribution ID",
      type: aws.ssm.ParameterType.String,
      value: frontendCloudFrontInfo.getFrontendDistributionId(),
    });

    new aws.ssm.Parameter(
      "code-delivery-frontend-cloudfront-distribution-url",
      {
        name: FrontendParameterStoreInfo.CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY,
        description: "Frontend Distribution URL",
        type: aws.ssm.ParameterType.String,
        value: pulumi.interpolate`https://${frontendCloudFrontInfo.getFrontendDistributionDomainName()}`,
      },
    );

    new aws.ssm.Parameter("code-delivery-frontend-bucket-name", {
      name: FrontendParameterStoreInfo.CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY,
      description: "Frontend S3 Bucket name",
      type: aws.ssm.ParameterType.String,
      value: this.getFrontendBucketName(),
    });
  }
}
