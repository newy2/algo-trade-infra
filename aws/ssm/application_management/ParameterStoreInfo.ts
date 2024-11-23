import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import EcrInfo from "../../ecr/EcrInfo";
import { RdsInfo } from "../../rds/RdsInfo";
import VpcInfo from "../../vpc/VpcInfo";

export default class ParameterStoreInfo {
  public static readonly ECR_PRIVATE_REPOSITORY_URL_KEY = "/ecr/repository/url";
  public static readonly RDS_ENDPOINT_KEY = "/rds/endpoint";
  public static readonly RDS_ADDRESS_KEY = "/rds/address";
  public static readonly RDS_USERNAME_KEY = "/rds/username";
  public static readonly RDS_PASSWORD_KEY = "/rds/password";
  public static readonly RDS_EICE_RDS_CONNECT_ID_KEY =
    "/vpc/eice/rds-connect/id";

  constructor(vpcInfo: VpcInfo, ecrInfo: EcrInfo, rdsInfo: RdsInfo) {
    this.setRdsConnectEndpointId(vpcInfo.getRdsConnectEndpointId());
    this.setEcrRepositoryUrl(ecrInfo.getPrivateRepositoryUrl());
    this.setRdsInfo(rdsInfo);
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
}
