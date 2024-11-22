import { BatchDeleteImageCommand, DescribeImagesCommand, ECRClient } from "@aws-sdk/client-ecr";

export const handler = async (event) => {
  const repositoryName = process.env.REPOSITORY_NAME;
  const ecrClient = new ECRClient();

  try {
    const response = await ecrClient.send(new DescribeImagesCommand({
      repositoryName
    }));
    const { imageDetails } = response;

    imageDetails.sort((a, b) => (new Date(a.imagePushedAt) - new Date(b.imagePushedAt)));

    if (imageDetails.length > 2) {
      const deleteImageIds = imageDetails
        .slice(0, imageDetails.length - 2)
        .map(each => ({
          imageDigest: each.imageDigest
        }));

      await ecrClient.send(new BatchDeleteImageCommand({
        repositoryName,
        imageIds: deleteImageIds
      }));
      console.log(`Deleted ${deleteImageIds.length} images.`);
    } else {
      console.log("No images to delete.");
    }
  } catch (error) {
    console.error("Error cleaning up ECR images:", error);
  }
};
