import { describe, expect, test, vi, afterEach } from "vitest";

import { getRunConfig } from "../../../../src/modules/guide/components/Toolbar/V2/helpers";

describe("Toolbar V2 helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe("getRunConfig", () => {
    test("returns isVisible true when URL param is 'true'", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?knock_guide_toolbar=true" },
        writable: true,
        configurable: true,
      });

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: true });
    });

    test("returns isVisible false when URL param is 'false'", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?knock_guide_toolbar=false" },
        writable: true,
        configurable: true,
      });

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: false });
    });

    test("returns default config when URL param is absent", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        writable: true,
        configurable: true,
      });

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: false });
    });

    test("includes focusedGuideKeys when focused_guide_key URL param is present", () => {
      Object.defineProperty(window, "location", {
        value: {
          search: "?knock_guide_toolbar=true&focused_guide_key=my_guide",
        },
        writable: true,
        configurable: true,
      });

      const config = getRunConfig();

      expect(config).toEqual({
        isVisible: true,
        focusedGuideKeys: { my_guide: true },
      });
    });

    test("does not include focusedGuideKeys when focused_guide_key param is absent", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?knock_guide_toolbar=true" },
        writable: true,
        configurable: true,
      });

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: true });
      expect(config).not.toHaveProperty("focusedGuideKeys");
    });
  });
});
