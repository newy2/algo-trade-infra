import { sendSlackMessage } from "/opt/nodejs/sendSlackMessage.mjs";
import { AutoScaling } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  // console.log("JSON.stringify(event, null, 2)", JSON.stringify(event, null, 2));
  // await sendSlackMessage("백엔드 배포 ASG Scale Up 요청 시작", JSON.stringify(event, null, 2));
  try {
    await sendSlackMessage("백엔드 배포 ASG Scale Up 요청 시작", "백엔드 배포 ASG Scale Up 요청 시작");
    const autoScaling = new AutoScaling(process.env.AUTO_SCALING_GROUP_NAME);
    await autoScaling.scaleUp();
    await sendSlackMessage("백엔드 배포 ASG Scale Up 요청 완료", "백엔드 배포 ASG Scale Up 요청 완료");
  } catch (error) {
    console.error("Error updating health check type:", error);
    await sendSlackMessage("[backend_delivery_init] 에러발생", error);
  }
};