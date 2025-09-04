import { describe, expect, test } from "vitest";

import { evaluateUrlRule } from "../../../src/clients/guide/helpers";
import type { GuideActivationUrlRuleData } from "../../../src/clients/guide/types";

describe("evaluateUrlRule", () => {
  describe("pathname variable with equal_to operator", () => {
    test("matches exact pathname with leading slash", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("matches exact pathname without leading slash", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "dashboard",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("does not match different pathname", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/settings");

      expect(evaluateUrlRule(rule, url)).toBe(false);
    });

    test("does not match partial pathname", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dash",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(rule, url)).toBe(false);
    });

    test("matches nested pathnames exactly", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/admin/settings",
      };
      const url = new URL("https://example.com/admin/settings");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });
  });

  describe("pathname variable with contains operator", () => {
    test("matches when pathname contains the argument", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "dash",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("matches when pathname contains the argument in the middle", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "admin",
      };
      const url = new URL("https://example.com/super/admin/settings");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("does not match when pathname doesn't contain the argument", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "admin",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(rule, url)).toBe(false);
    });

    test("is case sensitive", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "Admin",
      };
      const url = new URL("https://example.com/admin");

      expect(evaluateUrlRule(rule, url)).toBe(false);
    });

    test("matches with special characters", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "user-profile",
      };
      const url = new URL("https://example.com/settings/user-profile/edit");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });
  });

  describe("block directive", () => {
    test("works with block directive and equal_to", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "block",
        variable: "pathname",
        operator: "equal_to",
        argument: "/settings",
      };
      const url = new URL("https://example.com/settings");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("works with block directive and contains", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "block",
        variable: "pathname",
        operator: "contains",
        argument: "private",
      };
      const url = new URL("https://example.com/user/private/data");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("handles root path", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/",
      };
      const url = new URL("https://example.com/");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("handles empty argument with contains", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "",
      };
      const url = new URL("https://example.com/dashboard");

      // Empty string is contained in any string
      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("handles URLs with query parameters", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL(
        "https://example.com/dashboard?tab=overview&user=123",
      );

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("handles URLs with hash fragments", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/dashboard#section-1");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("handles pathnames with trailing slashes", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard/",
      };
      const url = new URL("https://example.com/dashboard/");

      expect(evaluateUrlRule(rule, url)).toBe(true);
    });

    test("distinguishes between paths with and without trailing slashes", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/dashboard/");

      expect(evaluateUrlRule(rule, url)).toBe(false);
    });
  });
});
