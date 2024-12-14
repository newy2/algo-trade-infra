import {
  CloudFront,
  Ec2,
  isValidScaleUp,
  ParameterStore,
  PrivateEcr,
  Slack,
  sleep,
  Sqs
} from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const newestEc2InstanceId = event.detail.EC2InstanceId;

  const parameterStore = new ParameterStore();
  console.time("Init ParameterStore");
  const slack = new Slack(await parameterStore.getSlackUrl());
  const sqs = new Sqs(await parameterStore.getBackendRequestScaleDownSqsUrl());
  console.timeEnd("Init ParameterStore");

  try {
    await slack.sendMessage("ASG 인스턴스 Scale Up 완료 이벤트 수신");
    await isValidScaleUp(event, parameterStore);
    const appEnvList = process.env.APP_ENV_LIST.split(",");
    if (appEnvList.length === 0) {
      throw new Error(`APP_ENV_LIST 가 비었습니다.`);
    }

    const sleepSeconds = 60;
    await slack.sendMessage(`health check 대기 (${sleepSeconds} 초)`);
    await sleep(sleepSeconds * 1000);

    const updateFailReason = await Promise.allSettled(appEnvList.map(async (eachEnv) => {
      const eachEnvParameterStore = new ParameterStore(eachEnv);
      const repositoryName = await eachEnvParameterStore.getBackendEcrRepositoryName();
      if (await (new PrivateEcr()).getImageCount(repositoryName) === 0) {
        await slack.sendMessage(`[${eachEnv}] ECR 이미지가 없습니다`);
        return;
      }

      await slack.sendMessage(`[${eachEnv}] health check 시작`);
      const eachEc2 = new Ec2(newestEc2InstanceId);
      const eachEc2HttpPort = await eachEnvParameterStore.getBackendEc2HttpPort();
      await slack.sendMessage(`[${eachEnv}] ${await eachEc2.getHealthCheckUrl(eachEc2HttpPort)}`);

      // TODO ECR 유무에 따라 ec2 인증 진행하기
      const isHealthy = await eachEc2.checkHealthyApi(eachEc2HttpPort);
      if (!isHealthy) {
        throw new Error(`[${eachEnv}] health check 실패`);
      }
      await slack.sendMessage(`[${eachEnv}] health check 성공`);

      await slack.sendMessage(`[${eachEnv}] CF 업데이트 요청`);
      const eachCloudFront = new CloudFront(await eachEnvParameterStore.getBackendDistributionId());
      const isDeployed = await eachCloudFront.updateBackendOriginDomainName(await eachEc2.getPublicDnsName());
      if (!isDeployed) {
        throw new Error(`[${eachEnv}] CF 업데이트 실패`);
      }
      await slack.sendMessage(`[${eachEnv}] CF 업데이트 성공`);
    })).then((results) => {
      return results.find(each => each.status === "rejected")?.reason;
    });

    if (updateFailReason) {
      await slack.sendMessage("rollback 요청");
      await sqs.sendFailMessage();
      await slack.sendMessage("rollback 요청 완료");
      throw new Error(updateFailReason);
    } else {
      await sqs.sendDelaySuccessMessage();
      await slack.sendMessage("SQS success 메세지 전송 완료");
    }
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_verify_instance] 에러발생\n${error}`);
  }
};