import { CreateEventSourceMappingCommand, DeleteEventSourceMappingCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { validate } from "./util/utils.mjs";

export default class Lambda {
  constructor() {
    this._lambdaClient = new LambdaClient();
  }

  async createEventSourceMapping({ eventSourceArn, functionName }) {
    const response = await this._lambdaClient.send(new CreateEventSourceMappingCommand({
      EventSourceArn: eventSourceArn,
      FunctionName: functionName
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 202,
        actual: response["$metadata"].httpStatusCode
      }
    ]);

    return response.UUID;
  }

  async deleteEventSourceMapping(uuid) {
    const response = await this._lambdaClient.send(new DeleteEventSourceMappingCommand({
      UUID: uuid
    }));

    validate([
      {
        key: "responseStatusCode",
        expected: 202,
        actual: response["$metadata"].httpStatusCode
      },
      {
        key: "responseStatusCode",
        expected: uuid,
        actual: response.UUID
      }
    ]);
  }
}
