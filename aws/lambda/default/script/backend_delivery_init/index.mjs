import { Slack } from "/opt/nodejs/send_slack_api/index.mjs";
import { AutoScaling, ParameterStore } from "/opt/nodejs/aws_sdk_helper/index.mjs";

export const handler = async (event) => {
  // console.log("JSON.stringify(event, null, 2)", JSON.stringify(event, null, 2));
  const parameterStore = new ParameterStore();
  console.time("create Slack");
  const slack = new Slack(await parameterStore.getSlackUrl());
  console.timeEnd("create Slack");

  // await slack.sendMessage(`백엔드 배포 ASG Scale Up 요청 시작\n${JSON.stringify(event, null, 2)}`);
  try {
    await slack.sendMessage("백엔드 배포 ASG Scale Up 요청 시작");
    const autoScaling = new AutoScaling(await parameterStore.getBackendAutoScalingGroupName());
    await autoScaling.scaleUp();
    await slack.sendMessage("백엔드 배포 ASG Scale Up 요청 완료");
  } catch (error) {
    console.error(error);
    await slack.sendMessage(`[backend_delivery_init] 에러발생\n${error}`);
    throw error;
  }
};