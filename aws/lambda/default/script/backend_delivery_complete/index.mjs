import { sendSlackMessage } from "/opt/nodejs/send_slack_api/index.mjs";
import { AutoScaling, CloudFront, Ec2, Ec2List, Sqs } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const isSuccessMessage = event.Records[0].body === Sqs.SUCCESS_MESSAGE;
  try {
    await sendSlackMessage(`${isSuccessMessage ? "" : "[롤백] "} ASG Scale Down 진행`, `${isSuccessMessage ? "" : "[롤백] "} ASG Scale Down 진행`);

    const autoScaling = new AutoScaling(process.env.AUTO_SCALING_GROUP_NAME);
    await autoScaling.validateEc2InstanceSize();

    if (!isSuccessMessage) {
      const sqs = new Sqs(process.env.SQS_URL);
      const hasDelayMessage = await sqs.hasDelayMessage();

      if (hasDelayMessage) {
        await sqs.purgeQueue();
      }

      const ec2InstanceIds = await autoScaling.getEc2InstanceIds();
      const oldestEc2InstanceId = await (new Ec2List()).getOldestInstanceId(ec2InstanceIds);

      const ec2 = new Ec2(oldestEc2InstanceId);
      const oldestEc2DnsName = await ec2.getPublicDnsName();

      // 관리자가 직접 롤백 요청을 한 경우 (EC2 health check 는 통과했지만, 비즈니스 로직 에러가 발생한 경우)
      const cloudFront = new CloudFront(process.env.DISTRIBUTION_ID);
      if (!await cloudFront.isCurrentOriginDomainName(oldestEc2DnsName)) {
        await sendSlackMessage("CF 업데이트 요청", "CF 업데이트 요청");
        const isDeployed = await cloudFront.updateOriginDomainName(oldestEc2DnsName);
        await sendSlackMessage(`CF 업데이트 ${isDeployed ? "성공" : "실패"}`, `CF 업데이트 ${isDeployed ? "성공" : "실패"}`);
      }
    }

    await sendSlackMessage("ASG Scale Down 요청", "ASG Scale Down 요청");
    await autoScaling.scaleDown(isSuccessMessage);
    const isTerminated = await autoScaling.checkInstanceTerminated();
    await sendSlackMessage(`ASG 사이즈 조정 ${isTerminated ? "완료" : "실패"}`, `ASG 사이즈 조정 ${isTerminated ? "완료" : "실패"}`);
  } catch (error) {
    console.error("Error updating health check type:", error);
    await sendSlackMessage("[backend_delivery_complete] 에러발생", error);
  }
};
