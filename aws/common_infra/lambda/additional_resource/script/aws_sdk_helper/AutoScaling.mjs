import {
  AutoScalingClient,
  DescribeAutoScalingInstancesCommand,
  UpdateAutoScalingGroupCommand
} from "@aws-sdk/client-auto-scaling";
import { retryCall, validate } from "./util/utils.mjs";

export default class AutoScaling {
  static _TERMINATION_POLICY = {
    NEWEST_INSTANCE: "NewestInstance",
    OLDEST_INSTANCE: "OldestInstance"
  };
  static _SCALE_UP_EC2_SIZE = 2;
  static _SCALE_DOWN_EC2_SIZE = 1;

  constructor(autoScalingGroupName) {
    this._autoScalingClient = new AutoScalingClient();
    this._autoScalingGroupName = autoScalingGroupName;
  }

  async scaleUp() {
    const scaleUpInstanceSize = Math.min((await this.getEc2InstanceSize()) + 1, AutoScaling._SCALE_UP_EC2_SIZE);
    const response = await this._autoScalingClient.send(new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: this._autoScalingGroupName,
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
      ? AutoScaling._TERMINATION_POLICY.OLDEST_INSTANCE
      : AutoScaling._TERMINATION_POLICY.NEWEST_INSTANCE;

    const response = await this._autoScalingClient.send(new UpdateAutoScalingGroupCommand({
      AutoScalingGroupName: this._autoScalingGroupName,
      MinSize: AutoScaling._SCALE_DOWN_EC2_SIZE,
      MaxSize: AutoScaling._SCALE_DOWN_EC2_SIZE,
      DesiredCapacity: AutoScaling._SCALE_DOWN_EC2_SIZE,
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
    return AutoScaling._SCALE_UP_EC2_SIZE === await this.getEc2InstanceSize();
  }

  async checkInstanceTerminated() {
    return await retryCall({
      retryCount: 300,
      delay: 1000,
      func: async () => {
        const response = await this._autoScalingClient.send(new DescribeAutoScalingInstancesCommand());

        return AutoScaling._SCALE_DOWN_EC2_SIZE === response.AutoScalingInstances.length;
      }
    });
  }

  async _getRunningInstances() {
    const response = await this._autoScalingClient.send(new DescribeAutoScalingInstancesCommand());

    return response.AutoScalingInstances
      .filter(each => each.LifecycleState === "InService");
  }
}