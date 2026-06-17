import { describe, expect, test } from "vitest";

import { deepEqual } from "../../src/modules/core/deepEqual";

describe("deepEqual", () => {
  test("treats identical references and equal primitives as equal", () => {
    const obj = { a: 1 };
    expect(deepEqual(obj, obj)).toBe(true);
    expect(deepEqual(1, 1)).toBe(true);
    expect(deepEqual("a", "a")).toBe(true);
    expect(deepEqual(true, true)).toBe(true);
    expect(deepEqual(null, null)).toBe(true);
    expect(deepEqual(undefined, undefined)).toBe(true);
  });

  test("distinguishes differing primitives", () => {
    expect(deepEqual(1, 2)).toBe(false);
    expect(deepEqual("a", "b")).toBe(false);
    expect(deepEqual(null, undefined)).toBe(false);
    expect(deepEqual(0, false)).toBe(false);
  });

  test("treats NaN as equal to NaN", () => {
    expect(deepEqual(NaN, NaN)).toBe(true);
  });

  test("compares nested objects structurally", () => {
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })).toBe(true);
    expect(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })).toBe(false);
  });

  test("is independent of object key order", () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  test("distinguishes objects with differing key counts", () => {
    expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(deepEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
  });

  test("compares arrays by length and element", () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(deepEqual([{ a: 1 }], [{ a: 1 }])).toBe(true);
  });

  test("does not treat an array and an object as equal", () => {
    expect(deepEqual([], {})).toBe(false);
  });

  test("compares Date values by time", () => {
    expect(deepEqual(new Date("2020-01-01"), new Date("2020-01-01"))).toBe(
      true,
    );
    expect(deepEqual(new Date("2020-01-01"), new Date("2021-01-01"))).toBe(
      false,
    );
  });

  test("compares RegExp values by source and flags", () => {
    expect(deepEqual(/abc/gi, /abc/gi)).toBe(true);
    expect(deepEqual(/abc/g, /abc/i)).toBe(false);
    expect(deepEqual(/abc/, /abd/)).toBe(false);
  });
});
