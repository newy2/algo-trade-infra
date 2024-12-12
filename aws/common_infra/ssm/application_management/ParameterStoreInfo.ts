import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import VpcInfo from "../../vpc/VpcInfo";
import BaseAwsInfo from "../../../backend_infra/BaseAwsInfo";

export default class ParameterStoreInfo extends BaseAwsInfo {
  public static readonly RDS_EICE_RDS_CONNECT_ID_KEY =
    "/vpc/eice/rds-connect/id";

  constructor(vpcInfo: VpcInfo) {
    super();

    this.setRdsConnectEndpointId(
      vpcInfo.endpointInfo.getRdsConnectEndpointId(),
    );
  }

  private setRdsConnectEndpointId(rdsConnectEndpointId: pulumi.Output<string>) {
    new aws.ssm.Parameter("rds-connect-endpoint-id", {
      name: ParameterStoreInfo.RDS_EICE_RDS_CONNECT_ID_KEY,
      description: "RDS Connect Endpoint Id",
      type: aws.ssm.ParameterType.String,
      value: rdsConnectEndpointId,
    });
  }
}
