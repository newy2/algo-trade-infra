import * as aws from "@pulumi/aws";
import { LaunchTemplate } from "@pulumi/aws/ec2";
import AwsConfig from "../../../../util/AwsConfig";
import UserData from "./UserData";
import BackendAppInfra from "../../../backend_app_infra/BackendAppInfra";
import CommonInfra from "../../../common_infra/CommonInfra";

export default class LaunchTemplateInfo extends AwsConfig {
  private static FREE_TIER_OPTION = {
    creditSpecification: {
      cpuCredits: "standard",
    },
    instanceType: aws.ec2.InstanceType.T2_Micro,
  };

  private readonly backendServerLaunchTemplate: LaunchTemplate;

  constructor(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    super();

    this.backendServerLaunchTemplate = this.createBackendServerLaunchTemplate(
      backendAppInfraList,
      commonInfra,
    );
  }

  public getBackendSeverLaunchTemplateId() {
    return this.backendServerLaunchTemplate.id;
  }

  private createBackendServerLaunchTemplate(
    backendAppInfraList: BackendAppInfra[],
    commonInfra: CommonInfra,
  ) {
    const name = "backend-server-launch-template";

    return new aws.ec2.LaunchTemplate(name, {
      ...LaunchTemplateInfo.FREE_TIER_OPTION,
      name,
      // disableApiStop: false,
      // disableApiTermination: false,
      updateDefaultVersion: true,
      iamInstanceProfile: {
        arn: commonInfra.iamInfo.roleInfo.getEc2InstanceProfileArn(),
      },
      imageId: this.getAmazonAmiId(),
      metadataOptions: {
        httpEndpoint: "enabled",
        httpPutResponseHopLimit: 2,
        httpTokens: "required",
      },
      networkInterfaces: [
        {
          associatePublicIpAddress: "true",
          deleteOnTermination: "true",
          securityGroups: commonInfra.vpcInfo.securityGroupInfo
            .getEc2SecurityGroupIds()
            .concat(
              backendAppInfraList.map((each) =>
                each.vpcInfo.securityGroupInfo.getHttpSecurityGroupId(),
              ),
            ),
        },
      ],
      tagSpecifications: [
        {
          resourceType: "instance",
          tags: {
            Name: "algo-trade-server",
          },
        },
      ],
      userData: new UserData(backendAppInfraList).toBase64String(),
    });
  }

  private getAmazonAmiId() {
    return aws.ec2
      .getAmi({
        mostRecent: true,
        owners: ["amazon"],
        filters: [
          { name: "name", values: ["al2023-ami-2023*"] }, // or "amzn2-ami-hvm-*"
          { name: "architecture", values: ["x86_64"] },
          { name: "virtualization-type", values: ["hvm"] },
        ],
      })
      .then((it) => it.id);
  }
}
