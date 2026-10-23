import { describe, expect, test } from "vitest";

import { cx } from "../../src/modules/core/cx";

describe("cx", () => {
  test("joins multiple class names with a space", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  test("merges a base class with an optional className prop", () => {
    expect(cx("knock-guide-banner", undefined)).toBe("knock-guide-banner");
    expect(cx("knock-guide-banner", "custom")).toBe(
      "knock-guide-banner custom",
    );
  });

  test("drops falsy values", () => {
    expect(cx("a", undefined, "b", null, false, "")).toBe("a b");
  });

  test("supports conditional modifier classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cx("btn", isActive && "btn--active", isDisabled && "btn--disabled"),
    ).toBe("btn btn--active");
  });

  test("returns an empty string when given no truthy values", () => {
    expect(cx(undefined, null, false)).toBe("");
  });
});
