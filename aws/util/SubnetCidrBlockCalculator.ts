import {
  collapseIPv6Number,
  IPv4CidrRange,
  IPv6CidrRange,
  Validator,
} from "ip-num";

type CidrRangeType = IPv4CidrRange | IPv6CidrRange;

export default class SubnetCidrBlockCalculator {
  protected readonly isIPv4Cidr: boolean;
  protected readonly firstSubnetCidrRange: CidrRangeType;

  constructor(vpcCidrBlock: string, subnetCidrMask: number) {
    this.isIPv4Cidr = this.isValidIPv4Cidr(vpcCidrBlock);
    this.firstSubnetCidrRange = this.createFirstSubnetCidrRange(
      vpcCidrBlock,
      subnetCidrMask,
    );
  }

  nextCidrBlock(nextCount: number) {
    if (nextCount < 0) {
      throw Error("nextCount must be greater than or equal to 0");
    }

    return this.toCidrStringFormat(this.getNextCidrRange(nextCount));
  }

  private isValidIPv4Cidr(vpcCidrBlock: string) {
    const [result] = Validator.isValidIPv4CidrNotation(vpcCidrBlock);
    return result;
  }

  private createFirstSubnetCidrRange(
    vpcCidrBlock: string,
    subnetCidrMask: number,
  ) {
    const vpcCidrRange = this.newCidrRange(vpcCidrBlock);
    const vpcFirstIpAddress = vpcCidrRange.getFirst();

    return this.newCidrRange(`${vpcFirstIpAddress}/${subnetCidrMask}`);
  }

  private newCidrRange(cidrBlock: string) {
    const cidrRangeClass = this.isIPv4Cidr ? IPv4CidrRange : IPv6CidrRange;
    return cidrRangeClass.fromCidr(cidrBlock);
  }

  private getNextCidrRange(nextCount: number) {
    let result = this.firstSubnetCidrRange;
    for (let i = 0; i < nextCount; i++) {
      result = result.nextRange()!;
    }
    return result;
  }

  private toCidrStringFormat(cidrRange: CidrRangeType) {
    const cidrString = cidrRange.toCidrString();
    if (this.isIPv4Cidr) {
      return cidrString;
    }
    return collapseIPv6Number(cidrString);
  }
}
