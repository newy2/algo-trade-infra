import { DescribeImagesCommand, ECRClient } from "@aws-sdk/client-ecr";

export default class PrivateEcr {
  constructor() {
    this.ecrClient = new ECRClient();
  }

  async getImageCount(repositoryName) {
    const response = await this.ecrClient.send(new DescribeImagesCommand({
      repositoryName
    }));

    return response.imageDetails.length;
  }
}