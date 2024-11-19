import { assertEquals, assertThrows } from "./helper/Assertions";
import SubnetCidrBlockCalculator from "../util/SubnetCidrBlockCalculator";

describe("SubnetCidrBlockCalculator", () => {
  it("IPv4 서브넷 CIDR 계산하기", () => {
    const vpcCidrBlock = "172.31.0.0/16";
    const subnetCidrMask = 20;
    const calculator = new SubnetCidrBlockCalculator(
      vpcCidrBlock,
      subnetCidrMask,
    );

    assertThrows(() => calculator.nextCidrBlock(-1));
    assertEquals("172.31.0.0/20", calculator.nextCidrBlock(0));
    assertEquals("172.31.16.0/20", calculator.nextCidrBlock(1));
    assertEquals("172.31.32.0/20", calculator.nextCidrBlock(2));
  });

  it("IPv6 서브넷 CIDR 계산하기", () => {
    const vpcCidrBlock = "2406:da1c:24e:a500::/56";
    const subnetCidrMask = 64;
    const calculator = new SubnetCidrBlockCalculator(
      vpcCidrBlock,
      subnetCidrMask,
    );

    assertThrows(() => calculator.nextCidrBlock(-1));
    assertEquals("2406:da1c:24e:a500::/64", calculator.nextCidrBlock(0));
    assertEquals("2406:da1c:24e:a501::/64", calculator.nextCidrBlock(1));
    assertEquals("2406:da1c:24e:a502::/64", calculator.nextCidrBlock(2));
  });
});
