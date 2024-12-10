import {
  collapseIPv6Number,
  IPv4,
  IPv4CidrRange,
  IPv6CidrRange,
  Pool,
  RangedSet,
  Validator,
} from "ip-num";
import { last } from "lodash";
import { assertEquals, assertFalse, assertTrue } from "../../helper/Assertions";

describe("ip-num 테스트", () => {
  describe("IPv4", () => {
    describe("CidrBlock 값 계산하기", () => {
      const cidrRange = IPv4CidrRange.fromCidr("172.31.240.0/20");

      it("현재 CidrBlock 계산하기", () => {
        const current = cidrRange.toCidrString();
        assertEquals("172.31.240.0/20", current);
      });

      it("이전 CidrBlock 계산하기", () => {
        const prev = cidrRange.previousRange()?.toCidrString();
        assertEquals("172.31.224.0/20", prev);
      });

      it("다음 CidrBlock 계산하기", () => {
        const next = cidrRange.nextRange()?.toCidrString();
        assertEquals("172.32.0.0/20", next);
      });
    });
  });

  describe("IPv6", () => {
    const ipAddress = "2406:da1c:24e:a600:0:0:0:0";

    describe("CidrBlock 값 계산하기", () => {
      const cidrRange = IPv6CidrRange.fromCidr(`${ipAddress}/64`);

      it("현재 CidrBlock 계산하기", () => {
        const current = cidrRange.toCidrString();
        assertEquals("2406:da1c:24e:a600::/64", collapseIPv6Number(current));
      });

      it("이전 CidrBlock 계산하기", () => {
        const prev = cidrRange.previousRange()?.toCidrString() || "";
        assertEquals("2406:da1c:24e:a5ff::/64", collapseIPv6Number(prev));
      });

      it("다음 CidrBlock 계산하기", () => {
        const next = cidrRange.nextRange()?.toCidrString() || "";
        assertEquals("2406:da1c:24e:a601::/64", collapseIPv6Number(next));
      });
    });

    describe("Double Colon IP 주소로 축약하기", () => {
      it("CidrBlock 이 없는 경우", () => {
        const collapsed = collapseIPv6Number(ipAddress);
        assertEquals("2406:da1c:24e:a600::", collapsed);
      });

      it("CidrBlock 이 있는 경우", () => {
        const collapsed = collapseIPv6Number(`${ipAddress}/64`);
        assertEquals("2406:da1c:24e:a600::/64", collapsed);
      });
    });

    it("VPC CidrBlock 으로 Subnet CidrBlock 계산하기", () => {
      const vpcCidrRange = IPv6CidrRange.fromCidr(`${ipAddress}/56`);
      const subnetCidrRange = IPv6CidrRange.fromCidr(
        `${vpcCidrRange.getFirst()}/64`,
      );
      const subnetCidr = subnetCidrRange.toCidrString();

      assertEquals("2406:da1c:24e:a600::/64", collapseIPv6Number(subnetCidr));
    });
  });

  describe("공통 기능", () => {
    describe("리스트에서 가장 큰 CidrBlock 가져오기", () => {
      it("오름차순 리스트", () => {
        const pool = Pool.fromCidrRanges([
          IPv4CidrRange.fromCidr("172.31.0.0/20"),
          IPv4CidrRange.fromCidr("172.31.16.0/20"),
          IPv4CidrRange.fromCidr("172.31.32.0/20"),
        ]);

        assertLastCidr("172.31.32.0/20", pool);
      });

      it("내림차순 리스트", () => {
        const pool = Pool.fromCidrRanges([
          IPv4CidrRange.fromCidr("172.31.32.0/20"),
          IPv4CidrRange.fromCidr("172.31.16.0/20"),
          IPv4CidrRange.fromCidr("172.31.0.0/20"),
        ]);

        assertLastCidr("172.31.32.0/20", pool);
      });

      it("랜덤 리스트", () => {
        const pool = Pool.fromCidrRanges([
          IPv4CidrRange.fromCidr("172.31.0.0/20"),
          IPv4CidrRange.fromCidr("172.31.32.0/20"),
          IPv4CidrRange.fromCidr("172.31.16.0/20"),
        ]);

        assertLastCidr("172.31.32.0/20", pool);
      });

      function assertLastCidr(expected: string, pool: Pool<RangedSet<IPv4>>) {
        const sortedList = pool.getRanges();
        const lastCidrString = last(sortedList)?.toCidrRange().toCidrString();
        assertEquals(expected, lastCidrString);
      }
    });
  });

  describe("IPv4, IPv6 CIDR 표기법 확인하기", () => {
    const ipv4Cidr = "172.31.16.0/20";
    const ipv6Cidr = "2406:da1c:24e:a600:0:0:0:0/64";
    const ipv6Cidr2 = "2406:da1c:24e:a600::/64";

    it("IPv4 CIDR 표기법 확인", () => {
      const [result1] = Validator.isValidIPv4CidrNotation(ipv4Cidr);
      const [result2] = Validator.isValidIPv4CidrNotation(ipv6Cidr);
      const [result3] = Validator.isValidIPv4CidrNotation(ipv6Cidr2);

      assertTrue(result1);
      assertFalse(result2);
      assertFalse(result3);
    });

    it("IPv6 CIDR 표기법 확인", () => {
      const [result1] = Validator.isValidIPv6CidrNotation(ipv4Cidr);
      const [result2] = Validator.isValidIPv6CidrNotation(ipv6Cidr);
      const [result3] = Validator.isValidIPv6CidrNotation(ipv6Cidr2);

      assertFalse(result1);
      assertTrue(result2);
      assertTrue(result3);
    });
  });
});
