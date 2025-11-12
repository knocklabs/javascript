import { describe, expect, test } from "vitest";
import { URLPattern } from "urlpattern-polyfill";

import {
  evaluateUrlRule,
  predicateUrlRules,
  predicateUrlPatterns,
} from "../../../src/clients/guide/helpers";
import type {
  GuideActivationUrlRuleData,
  KnockGuideActivationUrlPattern,
} from "../../../src/clients/guide/types";

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

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("matches exact pathname without leading slash", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "dashboard",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("does not match different pathname", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/settings");

      expect(evaluateUrlRule(url, rule)).toBe(false);
    });

    test("does not match partial pathname", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dash",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(url, rule)).toBe(false);
    });

    test("matches nested pathnames exactly", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/admin/settings",
      };
      const url = new URL("https://example.com/admin/settings");

      expect(evaluateUrlRule(url, rule)).toBe(true);
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

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("matches when pathname contains the argument in the middle", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "admin",
      };
      const url = new URL("https://example.com/super/admin/settings");

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("does not match when pathname doesn't contain the argument", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "admin",
      };
      const url = new URL("https://example.com/dashboard");

      expect(evaluateUrlRule(url, rule)).toBe(false);
    });

    test("is case sensitive", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "Admin",
      };
      const url = new URL("https://example.com/admin");

      expect(evaluateUrlRule(url, rule)).toBe(false);
    });

    test("matches with special characters", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "contains",
        argument: "user-profile",
      };
      const url = new URL("https://example.com/settings/user-profile/edit");

      expect(evaluateUrlRule(url, rule)).toBe(true);
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

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("works with block directive and contains", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "block",
        variable: "pathname",
        operator: "contains",
        argument: "private",
      };
      const url = new URL("https://example.com/user/private/data");

      expect(evaluateUrlRule(url, rule)).toBe(true);
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

      expect(evaluateUrlRule(url, rule)).toBe(true);
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
      expect(evaluateUrlRule(url, rule)).toBe(true);
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

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("handles URLs with hash fragments", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/dashboard#section-1");

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("handles pathnames with trailing slashes", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard/",
      };
      const url = new URL("https://example.com/dashboard/");

      expect(evaluateUrlRule(url, rule)).toBe(true);
    });

    test("distinguishes between paths with and without trailing slashes", () => {
      const rule: GuideActivationUrlRuleData = {
        directive: "allow",
        variable: "pathname",
        operator: "equal_to",
        argument: "/dashboard",
      };
      const url = new URL("https://example.com/dashboard/");

      expect(evaluateUrlRule(url, rule)).toBe(false);
    });
  });
});

describe("predicateUrlRules", () => {
  describe("with only block rules", () => {
    test("defaults to true when all rules are block directives", () => {
      const blockRules: GuideActivationUrlRuleData[] = [
        {
          directive: "block",
          variable: "pathname",
          operator: "equal_to",
          argument: "/admin",
        },
        {
          directive: "block",
          variable: "pathname",
          operator: "contains",
          argument: "private",
        },
      ];

      // URL that doesn't match any block rules - should default to true
      const url = new URL("https://example.com/public/page");
      expect(predicateUrlRules(url, blockRules)).toBe(true);
    });

    test("returns false when URL matches a block rule", () => {
      const blockRules: GuideActivationUrlRuleData[] = [
        {
          directive: "block",
          variable: "pathname",
          operator: "equal_to",
          argument: "/admin",
        },
      ];

      const url = new URL("https://example.com/admin");
      expect(predicateUrlRules(url, blockRules)).toBe(false);
    });

    test("returns true for empty array of rules", () => {
      const emptyRules: GuideActivationUrlRuleData[] = [];
      const url = new URL("https://example.com/any/path");

      // Empty array: every() returns true for empty arrays, so hasBlockRulesOnly is true, defaulting to true
      expect(predicateUrlRules(url, emptyRules)).toBe(true);
    });
  });

  describe("with mixed allow and block rules", () => {
    test("defaults to undefined when rules contain both allow and block directives", () => {
      const mixedRules: GuideActivationUrlRuleData[] = [
        {
          directive: "allow",
          variable: "pathname",
          operator: "equal_to",
          argument: "/dashboard",
        },
        {
          directive: "block",
          variable: "pathname",
          operator: "equal_to",
          argument: "/admin",
        },
      ];

      // URL that doesn't match any rules - should default to undefined
      const url = new URL("https://example.com/other");
      expect(predicateUrlRules(url, mixedRules)).toBe(undefined);
    });

    test("returns true when URL matches an allow rule", () => {
      const mixedRules: GuideActivationUrlRuleData[] = [
        {
          directive: "allow",
          variable: "pathname",
          operator: "equal_to",
          argument: "/dashboard",
        },
        {
          directive: "block",
          variable: "pathname",
          operator: "equal_to",
          argument: "/admin",
        },
      ];

      const url = new URL("https://example.com/dashboard");
      expect(predicateUrlRules(url, mixedRules)).toBe(true);
    });

    test("returns false when URL matches a block rule even with allow rules present", () => {
      const mixedRules: GuideActivationUrlRuleData[] = [
        {
          directive: "allow",
          variable: "pathname",
          operator: "contains",
          argument: "/admin",
        },
        {
          directive: "block",
          variable: "pathname",
          operator: "equal_to",
          argument: "/admin/users",
        },
      ];

      const url = new URL("https://example.com/admin/users");
      expect(predicateUrlRules(url, mixedRules)).toBe(false);
    });
  });

  describe("with only allow rules", () => {
    test("defaults to undefined when all rules are allow directives", () => {
      const allowRules: GuideActivationUrlRuleData[] = [
        {
          directive: "allow",
          variable: "pathname",
          operator: "equal_to",
          argument: "/dashboard",
        },
        {
          directive: "allow",
          variable: "pathname",
          operator: "contains",
          argument: "public",
        },
      ];

      // URL that doesn't match any allow rules - should default to undefined
      const url = new URL("https://example.com/other");
      expect(predicateUrlRules(url, allowRules)).toBe(undefined);
    });

    test("returns true when URL matches an allow rule", () => {
      const allowRules: GuideActivationUrlRuleData[] = [
        {
          directive: "allow",
          variable: "pathname",
          operator: "equal_to",
          argument: "/dashboard",
        },
      ];

      const url = new URL("https://example.com/dashboard");
      expect(predicateUrlRules(url, allowRules)).toBe(true);
    });
  });
});

describe("predicateUrlPatterns", () => {
  describe("with only block patterns", () => {
    test("defaults to true when all patterns are block directives", () => {
      const blockPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin/*" }),
        },
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/private/*" }),
        },
      ];

      // URL that doesn't match any block patterns - should default to true
      const url = new URL("https://example.com/public/page");
      expect(predicateUrlPatterns(url, blockPatterns)).toBe(true);
    });

    test("returns false when URL matches a block pattern", () => {
      const blockPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin/*" }),
        },
      ];

      const url = new URL("https://example.com/admin/settings");
      expect(predicateUrlPatterns(url, blockPatterns)).toBe(false);
    });

    test("returns true for empty array of patterns", () => {
      const emptyPatterns: KnockGuideActivationUrlPattern[] = [];
      const url = new URL("https://example.com/any/path");

      // Empty array: every() returns true for empty arrays, so hasBlockPatternsOnly is true, defaulting to true
      expect(predicateUrlPatterns(url, emptyPatterns)).toBe(true);
    });
  });

  describe("with mixed allow and block patterns", () => {
    test("defaults to undefined when patterns contain both allow and block directives", () => {
      const mixedPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard/*" }),
        },
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin/*" }),
        },
      ];

      // URL that doesn't match any patterns - should default to undefined
      const url = new URL("https://example.com/other");
      expect(predicateUrlPatterns(url, mixedPatterns)).toBe(undefined);
    });

    test("returns true when URL matches an allow pattern", () => {
      const mixedPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard/*" }),
        },
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin/*" }),
        },
      ];

      const url = new URL("https://example.com/dashboard/overview");
      expect(predicateUrlPatterns(url, mixedPatterns)).toBe(true);
    });

    test("returns false when URL matches a block pattern even with allow patterns present", () => {
      const mixedPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/admin/*" }),
        },
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin/users" }),
        },
      ];

      const url = new URL("https://example.com/admin/users");
      expect(predicateUrlPatterns(url, mixedPatterns)).toBe(false);
    });
  });

  describe("with only allow patterns", () => {
    test("defaults to undefined when all patterns are allow directives", () => {
      const allowPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard/*" }),
        },
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/public/*" }),
        },
      ];

      // URL that doesn't match any allow patterns - should default to undefined
      const url = new URL("https://example.com/other");
      expect(predicateUrlPatterns(url, allowPatterns)).toBe(undefined);
    });

    test("returns true when URL matches an allow pattern", () => {
      const allowPatterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard/*" }),
        },
      ];

      const url = new URL("https://example.com/dashboard/stats");
      expect(predicateUrlPatterns(url, allowPatterns)).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("handles patterns with wildcards correctly", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/*/admin" }),
        },
      ];

      const matchingUrl = new URL("https://example.com/users/admin");
      const nonMatchingUrl = new URL("https://example.com/public/page");

      expect(predicateUrlPatterns(matchingUrl, patterns)).toBe(false);
      expect(predicateUrlPatterns(nonMatchingUrl, patterns)).toBe(true);
    });

    test("handles exact URL patterns", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/specific-page" }),
        },
      ];

      const exactUrl = new URL("https://example.com/specific-page");
      const differentUrl = new URL("https://example.com/other-page");

      expect(predicateUrlPatterns(exactUrl, patterns)).toBe(false);
      expect(predicateUrlPatterns(differentUrl, patterns)).toBe(true);
    });
  });
});
