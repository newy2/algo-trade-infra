import {
  AutoScaling,
  CloudFront,
  Ec2,
  Ec2List,
  ParameterStore,
  Slack,
  Sqs
} from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const isSuccessMessage = event.Records[0].body === Sqs.SUCCESS_MESSAGE;

  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    await slack.sendMessage(`${isSuccessMessage ? "" : "[롤백] "} ASG Scale Down 진행`);

    const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
    await autoScaling.validateEc2InstanceSize();

    if (!isSuccessMessage) {
      const sqs = new Sqs(await parameterStore.getBackendRequestScaleDownSqsUrl());
      const hasDelayMessage = await sqs.hasDelayMessage();

      if (hasDelayMessage) {
        await sqs.purgeQueue();
      }

      const ec2InstanceIds = await autoScaling.getEc2InstanceIds();
      const oldestEc2InstanceId = await (new Ec2List()).getOldestInstanceId(ec2InstanceIds);

      const ec2 = new Ec2(oldestEc2InstanceId);
      const oldestEc2DnsName = await ec2.getPublicDnsName();

      const appEnvList = process.env.APP_ENV_LIST.split(",");
      if (appEnvList.length === 0) {
        throw new Error(`APP_ENV_LIST 가 비었습니다.`);
      }

      // 관리자가 직접 롤백 요청을 한 경우 (EC2 health check 는 통과했지만, 비즈니스 로직 에러가 발생한 경우)
      await Promise.all(appEnvList.map(async (eachEnv) => {
        const eachEnvParameterStore = new ParameterStore(eachEnv);
        const eachCloudFront = new CloudFront(await eachEnvParameterStore.getBackendDistributionId());
        if (!await eachCloudFront.isCurrentOriginDomainName(oldestEc2DnsName)) {
          await slack.sendMessage(`[${eachEnv}] CF 업데이트 요청`);
          const isDeployed = await eachCloudFront.updateBackendOriginDomainName(oldestEc2DnsName);
          if (!isDeployed) {
            throw new Error(`[${eachEnv}] CF 업데이트 실패`);
          }
          await slack.sendMessage(`[${eachEnv}] CF 업데이트 성공`);
        }
      }));
    }

    await slack.sendMessage("ASG Scale Down 요청");
    await autoScaling.scaleDown(isSuccessMessage);
    const isTerminated = await autoScaling.checkInstanceTerminated();
    await slack.sendMessage(`ASG 사이즈 조정 ${isTerminated ? "완료" : "실패"}`);
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_scale_down] 에러발생\n${error}`);
    throw error;
  }
};
