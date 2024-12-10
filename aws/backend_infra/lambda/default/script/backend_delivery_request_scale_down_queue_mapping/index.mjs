import { isValidScaleUp, Lambda, ParameterStore, Slack } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  try {
    const isScaleUp = await isValidScaleUp(event, parameterStore);
    if (isScaleUp) {
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