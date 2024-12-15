import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export const genName = (...strings: string[]) => strings.join("-");

export function createNameTag(
  name: string,
  args: { resourceId: pulumi.Input<string>; value: string },
) {
  return new aws.ec2.Tag(name, {
    resourceId: args.resourceId,
    key: "Name",
    value: args.value,
  });
}
