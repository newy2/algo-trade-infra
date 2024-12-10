import { AutoScaling } from "../index.mjs";

export async function retryCall({ retryCount, delay, func }) {
  for (let i = 0; i < retryCount; i++) {
    try {
      if (await func()) {
        return true;
      }
    } catch (e) {
      console.error("[retryCall] error: ", e);
    }

    await sleep(delay);
  }
  return false;
}

export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function validate(list) {
  list.forEach(each => {
    if (each.expected !== each.actual) {
      throw new Error(`[validate][${each.key}] expected(${each.expected})와 actual(${each.actual})이 다릅니다.`);
    }
  });
}

export async function isValidScaleUp(autoScalingGroupEvent, parameterStore) {
  const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
  const ec2InstanceCount = (await autoScaling.getEc2InstanceIds()).length;

  const detailType = autoScalingGroupEvent["detail-type"];
  if ("EC2 Instance Terminate Successful" === detailType && ec2InstanceCount === 1) {
    return false;
  }

  if ("EC2 Instance Launch Successful" === detailType && ec2InstanceCount === 2) {
    return true;
  }

  /**
   * 1. 최초 `pulumi up` 명령어 호출 시 발생
   * 2. `pulumi down` 명령어 호출 시 발생
   * */
  throw new Error(`지원하지 않는 조건입니다. (detailType: ${detailType}, ec2InstanceCount: ${ec2InstanceCount})`);
}