import { Slack } from "/opt/nodejs/send_slack_api/index.mjs";
import { CloudFront, Ec2, ParameterStore, sleep, Sqs } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const ec2InstanceId = event.detail.EC2InstanceId;

  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    // await slack.sendMessage(`Scale Down 메세지 수신 ${JSON.stringify(event, null, 2)}`);
    await slack.sendMessage("ASG 인스턴스 Scale Up 완료 이벤트 수신");
    await sleep(60 * 1000);

    await slack.sendMessage("health check 시작");
    const ec2 = new Ec2(ec2InstanceId);
    const isHealthy = await ec2.checkHealthyApi();
    await slack.sendMessage([
      `health check 결과 (isHealth: ${isHealthy})`,
      await ec2.getHealthCheckUrl()
    ].join("\n"));

    const sqs = new Sqs(await parameterStore.getBackendSqsCompleteUrl());
    if (!isHealthy) {
      await slack.sendMessage("rollback 요청");
      await sqs.sendFailMessage();
      await slack.sendMessage("rollback 요청 완료");
      return;
    }

    const cloudFront = new CloudFront(await parameterStore.getBackendDistributionId());

    await slack.sendMessage("CF 업데이트 요청");
    const isDeployed = await cloudFront.updateOriginDomainName(await ec2.getPublicDnsName());
    await slack.sendMessage(`CF 업데이트 ${isDeployed ? "성공" : "실패"}`);

    await sqs.sendDelaySuccessMessage();
    await slack.sendMessage("SQS success 메세지 전송 완료");
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_processing] 에러발생\n${error}`);
    throw error;
  }
};