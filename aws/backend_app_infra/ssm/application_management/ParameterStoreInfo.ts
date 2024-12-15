import * as aws from "@pulumi/aws";
import EcrInfo from "../../../backend_app_infra/ecr/EcrInfo";
import CloudFrontInfo from "../../../backend_app_infra/cloudfront/CloudFrontInfo";
import { AppEnv } from "../../../util/enums";
import { genName } from "../../../util/utils";

export default class ParameterStoreInfo {
  public static readonly CODE_DELIVERY_BACKEND_ECR_REPOSITORY_URL_KEY =
    "/code/delivery/{appEnv}/backend/ecr/repository/url";
  public static readonly CODE_DELIVERY_BACKEND_ECR_REPOSITORY_NAME_KEY =
    "/code/delivery/{appEnv}/backend/ecr/repository/name";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_ID_KEY =
    "/code/delivery/{appEnv}/backend/cloudfront/distribution/id";
  public static readonly CODE_DELIVERY_BACKEND_DISTRIBUTION_URL_KEY =
    "/code/delivery/{appEnv}/backend/cloudfront/distribution/url";
  public static readonly CODE_DELIVERY_BACKEND_EC2_HTTP_PORT_KEY =
    "/code/delivery/{appEnv}/backend/ec2/http/port";

  constructor(
    appEnv: AppEnv,
    httpPort: number,
    ecrInfo: EcrInfo,
    cloudFrontInfo: CloudFrontInfo,
  ) {
    this.setCodeDeliveryInfo(appEnv, httpPort, cloudFrontInfo, ecrInfo);
  }

  public static getCodeDeliveryBackendEcrRepositoryUrl(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_BACKEND_ECR_REPOSITORY_URL_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryBackendEcrRepositoryName(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_BACKEND_ECR_REPOSITORY_NAME_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryBackendDistributionId(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_BACKEND_DISTRIBUTION_ID_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryBackendDistributionUrl(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_BACKEND_DISTRIBUTION_URL_KEY,
      appEnv,
    );
  }

  public static getCodeDeliveryBackendEc2HttpPort(appEnv: AppEnv) {
    return this.getReplaceKey(
      this.CODE_DELIVERY_BACKEND_EC2_HTTP_PORT_KEY,
      appEnv,
    );
  }

  private static getReplaceKey(format: string, replaceValue: string) {
    return format.replace(new RegExp("{appEnv}", "g"), replaceValue);
  }

  private setCodeDeliveryInfo(
    appEnv: AppEnv,
    httpPort: number,
    cloudFrontInfo: CloudFrontInfo,
    ecrInfo: EcrInfo,
  ) {
    const prefix = genName(appEnv, "code-delivery-backend");

    new aws.ssm.Parameter(genName(prefix, "ecr-repository-url"), {
      name: ParameterStoreInfo.getCodeDeliveryBackendEcrRepositoryUrl(appEnv),
      description: `[${appEnv}] Backend ECR repository URL`,
      type: aws.ssm.ParameterType.String,
      value: ecrInfo.privateRepositoryInfo.getPrivateRepositoryUrl(),
    });

    new aws.ssm.Parameter(genName(prefix, "ecr-repository-name"), {
      name: ParameterStoreInfo.getCodeDeliveryBackendEcrRepositoryName(appEnv),
      description: `[${appEnv}] Backend ECR repository name`,
      type: aws.ssm.ParameterType.String,
      value: ecrInfo.privateRepositoryInfo.getPrivateRepositoryName(),
    });

    new aws.ssm.Parameter(genName(prefix, "cloudfront-distribution-id"), {
      name: ParameterStoreInfo.getCodeDeliveryBackendDistributionId(appEnv),
      description: `[${appEnv}] Backend Distribution ID`,
      type: aws.ssm.ParameterType.String,
      value: cloudFrontInfo.distributionInfo.getBackendDistributionId(),
    });

    new aws.ssm.Parameter(genName(prefix, "cloudfront-distribution-url"), {
      name: ParameterStoreInfo.getCodeDeliveryBackendDistributionUrl(appEnv),
      description: `[${appEnv}] Backend Distribution URL`,
      type: aws.ssm.ParameterType.String,
      value:
        cloudFrontInfo.distributionInfo.getBackendDistributionFullDomainName(),
    });

    new aws.ssm.Parameter(genName(prefix, "ec2-http-port"), {
      name: ParameterStoreInfo.getCodeDeliveryBackendEc2HttpPort(appEnv),
      description: `[${appEnv}] EC2 HTTP Port`,
      type: aws.ssm.ParameterType.String,
      value: `${httpPort}`,
    });
  }
}
