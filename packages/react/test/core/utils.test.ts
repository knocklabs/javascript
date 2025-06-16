import { describe, expect, test, vi } from "vitest";

import { openPopupWindow } from "../../src/modules/core/utils";

// Helper to make window props configurable
function setWindowProp(key: string, value: unknown) {
  Object.defineProperty(window, key, {
    configurable: true,
    writable: true,
    value,
  });
}

describe("openPopupWindow", () => {
  test("opens centered popup with correct features", () => {
    // Arrange
    const url = "https://example.com";
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    setWindowProp("innerWidth", 1024);
    setWindowProp("innerHeight", 768);
    setWindowProp("screenLeft", 0);
    setWindowProp("screenTop", 0);

    // Act
    openPopupWindow(url);

    // Assert
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [calledUrl, target, features] = openSpy.mock.calls[0]!;
    expect(calledUrl).toBe(url);
    expect(target).toBe("_blank");
    const featuresStr = String(features);
    expect(featuresStr).toContain("width=600");
    expect(featuresStr).toContain("height=800");
    expect(featuresStr).toContain("top=-16");
    expect(featuresStr).toContain("left=212");

    openSpy.mockRestore();
  });
});
