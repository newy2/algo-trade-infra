import {
  AutoScaling,
  CloudFront,
  Ec2,
  Ec2List,
  ParameterStore,
  PrivateEcr,
  Slack,
  Sqs
} from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const isRequestRollback = !Sqs.isSuccessMessage(event.Records[0].body);

  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    await slack.sendMessage(`${isRequestRollback ? "[롤백] " : ""} ASG Scale Down 진행`);

    const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
    if (!(await autoScaling.canScaleDown())) {
      await slack.sendMessage("[backend_delivery_scale_down] Scale Down 가능한 EC2 인스턴스가 없습니다.");
      return;
    }

    if (isRequestRollback) {
      const appEnvList = process.env.APP_ENV_LIST.split(",");
      if (appEnvList.length === 0) {
        throw new Error(`APP_ENV_LIST 가 비었습니다.`);
      }

      await removeSqsSuccessMessage(await parameterStore.getBackendRequestScaleDownSqsUrl());
      const oldestEc2DnsName = await getOldestEc2DnsName(autoScaling);
      await Promise.all(appEnvList.map((appEnv) => {
        return rollbackCloudFront({
          appEnv,
          slack,
          oldestEc2DnsName
        });
      }));
    }

    await scaleDown({
      autoScaling,
      slack,
      isSuccess: !isRequestRollback
    });
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_scale_down] 에러발생\n${error}`);
    throw error;
  }
};

async function removeSqsSuccessMessage(sqlUrl) {
  const sqs = new Sqs(sqlUrl);
  const hasSuccessDeployMessage = await sqs.hasDelayMessage();
  if (hasSuccessDeployMessage) {
    await sqs.purgeQueue();
  }
}

async function getOldestEc2DnsName(autoScaling) {
  const ec2InstanceIds = await autoScaling.getEc2InstanceIds();
  const oldestEc2InstanceId = await (new Ec2List()).getOldestInstanceId(ec2InstanceIds);
  const ec2 = new Ec2(oldestEc2InstanceId);

  return await ec2.getPublicDnsName();
}

async function rollbackCloudFront({ appEnv, slack, oldestEc2DnsName }) {
  const parameterStore = new ParameterStore(appEnv);

  const ecr = new PrivateEcr();
  const repositoryName = await parameterStore.getBackendEcrRepositoryName();
  if (await ecr.isEmptyRepository(repositoryName)) {
    await slack.sendMessage(`[${appEnv}] ECR 이미지가 없습니다`);
    return;
  }

  const distributionId = await parameterStore.getBackendDistributionId();
  const cloudFront = new CloudFront(distributionId);
  if (await cloudFront.isCurrentOriginDomainName(oldestEc2DnsName)) {
    await slack.sendMessage(`[${appEnv}] CF Origin Domain 을 업데이트 하지 않아도 됩니다.`);
    return;
  }

  await slack.sendMessage(`[${appEnv}] CF 업데이트 요청`);
  const isDeployed = await cloudFront.updateBackendOriginDomainName(oldestEc2DnsName);
  if (!isDeployed) {
    throw new Error(`[${appEnv}] CF 업데이트 실패`);
  }

  await slack.sendMessage(`[${appEnv}] CF 업데이트 성공`);
}

async function scaleDown({ autoScaling, slack, isSuccess }) {
  await slack.sendMessage("ASG Scale Down 요청");
  await autoScaling.scaleDown(isSuccess);
  const isTerminated = await autoScaling.checkInstanceTerminated();
  if (!isTerminated) {
    throw Error("ASG 사이즈 조정 실패");
  }

  await slack.sendMessage("ASG 사이즈 조정 완료");
}