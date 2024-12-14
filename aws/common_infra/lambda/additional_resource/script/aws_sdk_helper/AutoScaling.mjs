import {
  AutoScalingClient,
  DescribeAutoScalingInstancesCommand,
  UpdateAutoScalingGroupCommand
} from "@aws-sdk/client-auto-scaling";
import { retryCall, validate } from "./util/utils.mjs";

export default class AutoScaling {
  static TERMINATION_POLICY = {
    NEWEST_INSTANCE: "NewestInstance",
    OLDEST_INSTANCE: "OldestInstance"
  };
  static SCALE_UP_EC2_SIZE = 2;
  static SCALE_DOWN_EC2_SIZE = 1;

  constructor(autoScalingGroupName) {
    this.autoScalingClient = new AutoScalingClient();
    this.autoScalingGroupName = autoScalingGroupName;
  }

  async scaleUp() {
    const scaleUpInstanceSize = Math.min((await this.getEc2InstanceSize()) + 1, AutoScaling.SCALE_UP_EC2_SIZE);
    const response = await this.autoScalingClient.send(new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: this.autoScalingGroupName,
      MinSize: scaleUpInstanceSize,
      MaxSize: scaleUpInstanceSize,
      DesiredCapacity: scaleUpInstanceSize
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async scaleDown(isSuccess) {
    const terminatePolicy = isSuccess
      ? AutoScaling.TERMINATION_POLICY.OLDEST_INSTANCE
      : AutoScaling.TERMINATION_POLICY.NEWEST_INSTANCE;

    const response = await this.autoScalingClient.send(new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: this.autoScalingGroupName,
      MinSize: AutoScaling.SCALE_DOWN_EC2_SIZE,
      MaxSize: AutoScaling.SCALE_DOWN_EC2_SIZE,
      DesiredCapacity: AutoScaling.SCALE_DOWN_EC2_SIZE,
      TerminationPolicies: [
        terminatePolicy
      ]
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 200,
        actual: response["$metadata"].httpStatusCode
      }
    ]);
  }

  async getEc2InstanceSize() {
    const runningInstances = await this._getRunningInstances();

    return runningInstances.length;
  }

  async getEc2InstanceIds() {
    const runningInstances = await this._getRunningInstances();

    return runningInstances.map(each => each.InstanceId);
  }


  async canScaleDown() {
    return AutoScaling.SCALE_UP_EC2_SIZE === await this.getEc2InstanceSize();
  }

  async checkInstanceTerminated() {
    return await retryCall({
      retryCount: 300,
      delay: 1000,
      func: async () => {
        const response = await this.autoScalingClient.send(new DescribeAutoScalingInstancesCommand());

        return AutoScaling.SCALE_DOWN_EC2_SIZE === response.AutoScalingInstances.length;
      }
    });
  }

  async _getRunningInstances() {
    const response = await this.autoScalingClient.send(new DescribeAutoScalingInstancesCommand());

    return response.AutoScalingInstances
      .filter(each => each.LifecycleState === "InService");
  }
}