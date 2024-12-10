import {
  CloudFront,
  Ec2,
  isValidScaleUp,
  ParameterStore,
  Slack,
  sleep,
  Sqs
} from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const ec2InstanceId = event.detail.EC2InstanceId;

  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    await isValidScaleUp(event, parameterStore);

    await slack.sendMessage("ASG 인스턴스 Scale Up 완료 이벤트 수신");
    await sleep(60 * 1000);

    await slack.sendMessage("health check 시작");
    const ec2 = new Ec2(ec2InstanceId);
    const isHealthy = await ec2.checkHealthyApi();
    await slack.sendMessage([
      `health check 결과 (isHealth: ${isHealthy})`,
      await ec2.getHealthCheckUrl()
    ].join("\n"));

    const sqs = new Sqs(await parameterStore.getBackendRequestScaleDownSqsUrl());
    if (!isHealthy) {
      await slack.sendMessage("rollback 요청");
      await sqs.sendFailMessage();
      await slack.sendMessage("rollback 요청 완료");
      return;
    }

    const cloudFront = new CloudFront(await parameterStore.getBackendDistributionId());

    await slack.sendMessage("CF 업데이트 요청");
    const isDeployed = await cloudFront.updateBackendOriginDomainName(await ec2.getPublicDnsName());
    if (!isDeployed) {
      throw new Error("CF 업데이트 실패");
    }
    await slack.sendMessage("CF 업데이트 성공");

    await sqs.sendDelaySuccessMessage();
    await slack.sendMessage("SQS success 메세지 전송 완료");
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_verify_instance] 에러발생\n${error}`);
  }
};