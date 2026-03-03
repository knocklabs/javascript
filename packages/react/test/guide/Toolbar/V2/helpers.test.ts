import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";

import {
  getRunConfig,
  clearRunConfigLS,
} from "../../../../src/modules/guide/components/Toolbar/V2/helpers";

const LOCAL_STORAGE_KEY = "knock_guide_debug";

describe("Toolbar V2 helpers", () => {
  let getItemSpy: ReturnType<typeof vi.fn>;
  let setItemSpy: ReturnType<typeof vi.fn>;
  let removeItemSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getItemSpy = vi.fn();
    setItemSpy = vi.fn();
    removeItemSpy = vi.fn();

    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: getItemSpy,
        setItem: setItemSpy,
        removeItem: removeItemSpy,
      },
      writable: true,
      configurable: true,
    });
  });

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

    test("writes to localStorage when URL param is present", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?knock_guide_toolbar=true" },
        writable: true,
        configurable: true,
      });

      getRunConfig();

      expect(setItemSpy).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ isVisible: true }),
      );
    });

    test("reads from localStorage when URL param is absent", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        writable: true,
        configurable: true,
      });

      getItemSpy.mockReturnValue(JSON.stringify({ isVisible: true }));

      const config = getRunConfig();

      expect(getItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);
      expect(config).toEqual({ isVisible: true });
    });

    test("returns default config when URL param is absent and localStorage is empty", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        writable: true,
        configurable: true,
      });

      getItemSpy.mockReturnValue(null);

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: false });
    });

    test("returns default config when localStorage throws", () => {
      Object.defineProperty(window, "location", {
        value: { search: "" },
        writable: true,
        configurable: true,
      });

      getItemSpy.mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: false });
    });

    test("URL param takes precedence over localStorage", () => {
      Object.defineProperty(window, "location", {
        value: { search: "?knock_guide_toolbar=false" },
        writable: true,
        configurable: true,
      });

      // localStorage has isVisible: true but URL says false
      getItemSpy.mockReturnValue(JSON.stringify({ isVisible: true }));

      const config = getRunConfig();

      expect(config).toEqual({ isVisible: false });
      // Should also overwrite localStorage with the URL value
      expect(setItemSpy).toHaveBeenCalledWith(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ isVisible: false }),
      );
    });
  });

  describe("clearRunConfigLS", () => {
    test("removes the config from localStorage", () => {
      clearRunConfigLS();

      expect(removeItemSpy).toHaveBeenCalledWith(LOCAL_STORAGE_KEY);
    });

    test("does not throw when localStorage is unavailable", () => {
      removeItemSpy.mockImplementation(() => {
        throw new Error("localStorage unavailable");
      });

      expect(() => clearRunConfigLS()).not.toThrow();
    });
  });
});
