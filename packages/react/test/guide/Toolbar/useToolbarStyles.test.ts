import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { useToolbarStyles } from "../../../src/modules/guide/components/Toolbar/useToolbarStyles";

const getStyleElement = () =>
  document.getElementById("knock-guide-toolbar-styles");

afterEach(() => {
  getStyleElement()?.remove();
});

describe("useToolbarStyles", () => {
  test("does not inject styles when disabled", () => {
    renderHook(() => useToolbarStyles(false));
    expect(getStyleElement()).toBeNull();
  });

  test("injects a style element into the document head when enabled", () => {
    renderHook(() => useToolbarStyles(true));
    const styleElement = getStyleElement();
    expect(styleElement).not.toBeNull();
    expect(styleElement?.parentElement).toBe(document.head);
  });

  test("injects styles once it becomes enabled", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useToolbarStyles(enabled),
      { initialProps: { enabled: false } },
    );
    expect(getStyleElement()).toBeNull();

    rerender({ enabled: true });
    expect(getStyleElement()).not.toBeNull();
  });

  test("injects only one style element across multiple instances", () => {
    renderHook(() => useToolbarStyles(true));
    renderHook(() => useToolbarStyles(true));
    expect(
      document.querySelectorAll("#knock-guide-toolbar-styles"),
    ).toHaveLength(1);
  });
});
