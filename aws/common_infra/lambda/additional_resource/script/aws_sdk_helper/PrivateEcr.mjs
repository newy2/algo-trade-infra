import { DescribeImagesCommand, ECRClient } from "@aws-sdk/client-ecr";

export default class PrivateEcr {
  constructor() {
    this._ecrClient = new ECRClient();
  }

  async getImageCount(repositoryName) {
    const response = await this._ecrClient.send(new DescribeImagesCommand({
      repositoryName
    }));

    return response.imageDetails.length;
  }
}