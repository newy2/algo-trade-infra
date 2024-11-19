import * as assert from "assert";

export function assertEquals(
  expected: unknown,
  actual: unknown,
  message?: string | Error,
) {
  assert.equal(actual, expected, message);
}

export function assertTrue(value: unknown, message?: string | Error) {
  assert.ok(value, message);
}

export function assertFalse(value: unknown, message?: string | Error) {
  assert.ok(!value, message);
}

export function assertThrows(block: () => unknown, message?: string | Error) {
  assert.throws(block, message);
}
