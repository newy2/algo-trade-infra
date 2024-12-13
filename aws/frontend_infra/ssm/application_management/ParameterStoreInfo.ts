import * as aws from "@pulumi/aws";
import BaseAwsInfo from "../../../backend_infra/BaseAwsInfo";
import CloudFrontInfo from "../../cloudfront/CloudFrontInfo";
import { AppEnv } from "../../../../util/enums";
import { genName } from "../../../../util/utils";

export default class ParameterStoreInfo extends BaseAwsInfo {
  private static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/{appEnv}/frontend/cloudfront/distribution/id";
  private static readonly CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/{appEnv}/frontend/cloudfront/distribution/url";
  private static readonly CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY =
    "/code/delivery/{appEnv}/frontend/s3/bucket/name";

  private readonly appEnv: AppEnv;

  constructor(appEnv: AppEnv, cloudFrontInfo: CloudFrontInfo) {
    super();

    this.appEnv = appEnv;
    this.setCodeDeliveryInfo(cloudFrontInfo);
  }

  public static getCodeDeliveryFrontendDistributionIdKey(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_FRONTEND_DISTRIBUTION_ID_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryFrontendDistributionUrlKey(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_FRONTEND_DISTRIBUTION_URL_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryFrontendBucketNameKey(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_FRONTEND_BUCKET_NAME_KEY,
      appEnv,
    );
  }

  private static getReplaceKey(format: string, replaceValue: string) {
    return format.replace(new RegExp("{appEnv}", "g"), replaceValue);
  }

  private setCodeDeliveryInfo(cloudFrontInfo: CloudFrontInfo) {
    const prefix = genName(this.appEnv, "code-delivery-frontend");

    new aws.ssm.Parameter(genName(prefix, "cloudfront-distribution-id"), {
      name: ParameterStoreInfo.getCodeDeliveryFrontendDistributionIdKey(
        this.appEnv,
      ),
      description: `[${this.appEnv}] Frontend Distribution ID`,
      type: aws.ssm.ParameterType.String,
      value: cloudFrontInfo.distributionInfo.getFrontendDistributionId(),
    });

    new aws.ssm.Parameter(genName(prefix, "cloudfront-distribution-url"), {
      name: ParameterStoreInfo.getCodeDeliveryFrontendDistributionUrlKey(
        this.appEnv,
      ),
      description: `[${this.appEnv}] Frontend Distribution URL`,
      type: aws.ssm.ParameterType.String,
      value:
        cloudFrontInfo.distributionInfo.getFrontendDistributionFullDomainName(),
    });

    new aws.ssm.Parameter(genName(prefix, "bucket-name"), {
      name: ParameterStoreInfo.getCodeDeliveryFrontendBucketNameKey(
        this.appEnv,
      ),
      description: `[${this.appEnv}] Frontend S3 Bucket name`,
      type: aws.ssm.ParameterType.String,
      value: genName(this.appEnv, this.getFrontendBucketName()),
    });
  }
}
