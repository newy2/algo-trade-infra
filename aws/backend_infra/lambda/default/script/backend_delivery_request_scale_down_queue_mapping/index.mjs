import { AutoScaling, Lambda, ParameterStore, Slack } from "/opt/nodejs/aws_sdk_helper/index.mjs";

const CREATE_MAPPING = "create-mapping";
const DELETE_MAPPING = "delete-mapping";

export const handler = async (event) => {
  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    const requestEvent = await parseEvent({
      parameterStore,
      autoScalingGroupEvent: event
    });

    if (requestEvent === CREATE_MAPPING) {
      await slack.sendMessage("EventSource 매핑 작업 시작");

      const lambda = new Lambda();
      const uuid = await lambda.createEventSourceMapping({
        eventSourceArn: await parameterStore.getBackendRequestScaleDownSqsArn(),
        functionName: await parameterStore.getBackendDeliveryScaleDownLambdaName()
      });
      await parameterStore.setBackendDeliveryScaleDownLambdaEventSourceUuid(uuid);

      await slack.sendMessage(`EventSource 매핑 완료 (UUID: ${uuid})`);
    } else {
      await slack.sendMessage("EventSource 매핑 제거 작업 시작");

      const lambda = new Lambda();
      const uuid = await parameterStore.getBackendDeliveryScaleDownLambdaEventSourceUuid();
      await lambda.deleteEventSourceMapping(uuid);
      await parameterStore.deleteBackendDeliveryScaleDownLambdaEventSourceUuid();

      await slack.sendMessage("EventSource 매핑 제거 완료");
    }

  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_request_scale_down_queue_mapping] 에러발생\n${error}`);
  }
};

async function parseEvent({ autoScalingGroupEvent, parameterStore }) {
  const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
  const ec2InstanceCount = await autoScaling.getEc2InstanceSize();

  const detailType = autoScalingGroupEvent["detail-type"];
  if ("EC2 Instance Terminate Successful" === detailType && ec2InstanceCount === 1) {
    return DELETE_MAPPING;
  }

  if ("EC2 Instance Launch Successful" === detailType && ec2InstanceCount === 2) {
    return CREATE_MAPPING;
  }

  /**
   * 1. 백엔드 서버 최초 배포 시 발생 (EC2 인스턴스: 0 -> 1)
   * 2. `pulumi down` 명령어 호출 시 발생
   * */
  throw new Error(`지원하지 않는 조건입니다. (detailType: ${detailType}, ec2InstanceCount: ${ec2InstanceCount})`);
}