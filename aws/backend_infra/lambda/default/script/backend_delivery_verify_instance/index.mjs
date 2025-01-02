import {
  AutoScaling,
  CloudFront,
  Ec2,
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
  console.timeEnd("Init ParameterStore");

  try {
    await slack.sendMessage("ASG 인스턴스 Scale Up 완료 이벤트 수신");
    const appEnvList = process.env.APP_ENV_LIST.split(",");
    if (appEnvList.length === 0) {
      throw new Error(`APP_ENV_LIST 가 비었습니다.`);
    }

    const sleepSeconds = 60;
    await slack.sendMessage(`health check 대기 (${sleepSeconds} 초)`);
    await sleep(sleepSeconds * 1000);

    const updateFailReason = await Promise.allSettled(appEnvList.map(async (appEnv) => {
      const eachEnvParameterStore = new ParameterStore(appEnv);

      if (await isEmptyEcrRepository(eachEnvParameterStore)) {
        await slack.sendMessage(`[${appEnv}] ECR 이미지가 없습니다`);
        return;
      }

      const ec2 = new Ec2(newestEc2InstanceId);
      await healthCheckEc2({
        slack,
        appEnv,
        ec2,
        httpPort: await eachEnvParameterStore.getBackendEc2HttpPort()
      });

      await updateCloudFront({
        slack,
        appEnv,
        distributionId: await eachEnvParameterStore.getBackendDistributionId(),
        backendOriginDomainName: await ec2.getPublicDnsName()
      });
    })).then((results) => {
      return results.find(each => each.status === "rejected")?.reason;
    });

    await sendSqsMessage({
      updateFailReason,
      slack,
      parameterStore
    });

  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_verify_instance] 에러발생\n${JSON.stringify(error, null, 2)}`);
  }
};

async function isEmptyEcrRepository(parameterStore) {
  const repositoryName = await parameterStore.getBackendEcrRepositoryName();
  const privateEcr = new PrivateEcr();

  return await privateEcr.isEmptyRepository(repositoryName);
}

async function healthCheckEc2({ appEnv, httpPort, ec2, slack }) {
  await slack.sendMessage(`[${appEnv}] health check 시작`);

  const healthCheckUrl = await ec2.getHealthCheckUrl(httpPort);
  await slack.sendMessage(`[${appEnv}] ${healthCheckUrl}`);

  const isHealthy = await ec2.checkHealthyApi(httpPort);
  if (!isHealthy) {
    throw new Error(`[${appEnv}] health check 실패`);
  }

  await slack.sendMessage(`[${appEnv}] health check 성공`);
}

async function updateCloudFront({ appEnv, slack, distributionId, backendOriginDomainName }) {
  await slack.sendMessage(`[${appEnv}] CF 업데이트 요청`);

  const cloudFront = new CloudFront(distributionId);
  const isDeployed = await cloudFront.updateBackendOriginDomainName(backendOriginDomainName);
  if (!isDeployed) {
    throw new Error(`[${appEnv}] CF 업데이트 실패`);
  }

  await slack.sendMessage(`[${appEnv}] CF 업데이트 성공`);
}

async function sendSqsMessage({ updateFailReason, slack, parameterStore }) {
  const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
  if (!(await autoScaling.canScaleDown())) {
    if (updateFailReason) {
      throw new Error(updateFailReason);
    }
    await slack.sendMessage("배포 완료 (SQS 미전송)");
    return;
  }

  const sqs = new Sqs(await parameterStore.getBackendRequestScaleDownSqsUrl());
  if (updateFailReason) {
    await slack.sendMessage("rollback 요청");
    await sqs.sendFailMessage();
    await slack.sendMessage("rollback 요청 완료");
    throw new Error(updateFailReason);
  } else {
    await sqs.sendDelaySuccessMessage();
    await slack.sendMessage("SQS success 메세지 전송 완료");
  }
}