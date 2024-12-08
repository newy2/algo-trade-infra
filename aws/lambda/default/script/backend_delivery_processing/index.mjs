import { sendSlackMessage } from "/opt/nodejs/sendSlackMessage.mjs";
import { CloudFront, Ec2, sleep, Sqs } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const ec2InstanceId = event.detail.EC2InstanceId;

  try {
    // await sendSlackMessage("Scale Down 메세지 수신", JSON.stringify(event, null, 2));
    await sendSlackMessage("ASG 인스턴스 Scale Up 완료 이벤트 수신", "ASG 인스턴스 Scale Up 완료 이벤트 수신");
    await sleep(60 * 1000);

    await sendSlackMessage("health check 시작", "health check 시작");
    const ec2 = new Ec2(ec2InstanceId);
    const isHealthy = await ec2.checkHealthyApi();
    await sendSlackMessage(`health check 결과 (isHealth: ${isHealthy})`, await ec2.getHealthCheckUrl());

    const sqs = new Sqs(process.env.SQS_URL);
    if (!isHealthy) {
      await sendSlackMessage("rollback 요청", "rollback 요청");
      await sqs.sendFailMessage();
      await sendSlackMessage("rollback 요청 완료", "rollback 요청 완료");
      return;
    }

    const cloudFront = new CloudFront(process.env.DISTRIBUTION_ID);

    await sendSlackMessage("CF 업데이트 요청", "CF 업데이트 요청");
    const isDeployed = await cloudFront.updateOriginDomainName(await ec2.getPublicDnsName());
    await sendSlackMessage(`CF 업데이트 ${isDeployed ? "성공" : "실패"}`, `CF 업데이트 ${isDeployed ? "성공" : "실패"}`);

    await sqs.sendDelaySuccessMessage();
    await sendSlackMessage("SQS success 메세지 전송 완료", "SQS success 메세지 전송 완료");
  } catch (error) {
    console.error("Error updating health check type:", error);
    await sendSlackMessage("[backend_delivery_processing] 에러발생", error);
  }
};