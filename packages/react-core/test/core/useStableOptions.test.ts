import { renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { useStableOptions } from "../../src";

describe("useStableOptions", () => {
  test("returns same object reference for deeply equal options", () => {
    const options1 = { a: 1, b: 2 };
    const options2 = { ...options1 };

    const { result, rerender } = renderHook(
      (options) => useStableOptions(options),
      {
        initialProps: options1,
      },
    );

    expect(result.current).toBe(options1);

    rerender(options2);

    // options1 should still be returned, since options2 is deeply equal
    expect(result.current).toBe(options1);
  });

  test("returns new object whenever options change", () => {
    const options1 = { a: 1, b: 2 };
    const options2 = { ...options1, b: 3 };

    const { result, rerender } = renderHook(
      (options) => useStableOptions(options),
      {
        initialProps: options1,
      },
    );

    expect(result.current).toBe(options1);

    rerender(options2);

    expect(result.current).toBe(options2);
  });
});
