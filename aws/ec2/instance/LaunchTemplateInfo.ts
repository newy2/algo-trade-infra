import * as aws from "@pulumi/aws";
import IamInfo from "../../iam/IamInfo";
import { LaunchTemplate } from "@pulumi/aws/ec2";
import VpcInfo from "../../vpc/VpcInfo";
import BaseAwsInfo from "../../BaseAwsInfo";
import UserData from "./UserData";

export default class LaunchTemplateInfo extends BaseAwsInfo {
  private static FREE_TIER_OPTION = {
    creditSpecification: {
      cpuCredits: "standard",
    },
    instanceType: aws.ec2.InstanceType.T2_Micro,
  };

  private readonly backendServerLaunchTemplate: LaunchTemplate;

  constructor(vpcInfo: VpcInfo, iamInfo: IamInfo) {
    super();

    this.backendServerLaunchTemplate = this.createBackendServerLaunchTemplate(
      vpcInfo,
      iamInfo,
    );
  }

  public getBackendSeverLaunchTemplateId() {
    return this.backendServerLaunchTemplate.id;
  }

  private createBackendServerLaunchTemplate(
    vpcInfo: VpcInfo,
    iamInfo: IamInfo,
  ) {
    const name = "backend-server-launch-template";

    return new aws.ec2.LaunchTemplate(name, {
      ...LaunchTemplateInfo.FREE_TIER_OPTION,
      name,
      // disableApiStop: false,
      // disableApiTermination: false,
      iamInstanceProfile: {
        arn: iamInfo.roleInfo.getEc2InstanceProfileArn(),
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
          securityGroups: vpcInfo.securityGroupInfo.getEc2SecurityGroupIds(),
        },
      ],
      tagSpecifications: [
        {
          resourceType: "instance",
          tags: {
            Name: this.getEc2ServerName(),
          },
        },
      ],
      userData: new UserData().toBase64String(),
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
