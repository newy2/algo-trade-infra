import * as assert from "assert";

export function assertEquals(expected, actual, message) {
  assert.equal(actual, expected, message);
}

export function assertDeepEquals(expected, actual, message) {
  assert.deepEqual(actual, expected, message);
}

export function assertTrue(value, message) {
  assert.ok(value, message);
}

export function assertFalse(value, message) {
  assert.ok(!value, message);
}

export function assertThrows(block, message) {
  assert.throws(block, message);
}