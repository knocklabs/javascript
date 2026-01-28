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

  describe("with search patterns", () => {
    test("returns true when URL matches an allow pattern with search params", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard", search: "tab=settings" }),
        },
      ];

      const matchingUrl = new URL("https://example.com/dashboard?tab=settings");
      const nonMatchingUrl = new URL("https://example.com/dashboard?tab=overview");

      expect(predicateUrlPatterns(matchingUrl, patterns)).toBe(true);
      expect(predicateUrlPatterns(nonMatchingUrl, patterns)).toBe(undefined);
    });

    test("returns false when URL matches a block pattern with search params", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/admin", search: "mode=debug" }),
        },
      ];

      const matchingUrl = new URL("https://example.com/admin?mode=debug");
      const nonMatchingUrl = new URL("https://example.com/admin?mode=normal");

      expect(predicateUrlPatterns(matchingUrl, patterns)).toBe(false);
      expect(predicateUrlPatterns(nonMatchingUrl, patterns)).toBe(true);
    });

    test("handles wildcard patterns in search params", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/page", search: "id=*" }),
        },
      ];

      const matchingUrl = new URL("https://example.com/page?id=123");
      const anotherMatchingUrl = new URL("https://example.com/page?id=abc");
      const nonMatchingUrl = new URL("https://example.com/page?other=value");

      expect(predicateUrlPatterns(matchingUrl, patterns)).toBe(true);
      expect(predicateUrlPatterns(anotherMatchingUrl, patterns)).toBe(true);
      expect(predicateUrlPatterns(nonMatchingUrl, patterns)).toBe(undefined);
    });

    test("matches when pathname matches but no search pattern specified", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/dashboard" }),
        },
      ];

      // Should match regardless of search params when no search pattern specified
      const urlWithSearch = new URL("https://example.com/dashboard?tab=settings");
      const urlWithoutSearch = new URL("https://example.com/dashboard");

      expect(predicateUrlPatterns(urlWithSearch, patterns)).toBe(true);
      expect(predicateUrlPatterns(urlWithoutSearch, patterns)).toBe(true);
    });

    test("block pattern with search takes precedence over allow pattern without search", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/settings/*" }),
        },
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/settings/admin", search: "dangerous=true" }),
        },
      ];

      const blockedUrl = new URL("https://example.com/settings/admin?dangerous=true");
      const allowedUrl = new URL("https://example.com/settings/admin?dangerous=false");

      expect(predicateUrlPatterns(blockedUrl, patterns)).toBe(false);
      expect(predicateUrlPatterns(allowedUrl, patterns)).toBe(true);
    });

    test("handles multiple search params in pattern", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/report", search: "type=sales&year=2024" }),
        },
      ];

      const matchingUrl = new URL("https://example.com/report?type=sales&year=2024");
      const partialMatchUrl = new URL("https://example.com/report?type=sales");
      const wrongOrderUrl = new URL("https://example.com/report?year=2024&type=sales");

      expect(predicateUrlPatterns(matchingUrl, patterns)).toBe(true);
      expect(predicateUrlPatterns(partialMatchUrl, patterns)).toBe(undefined);
      // URLPattern is sensitive to search param order
      expect(predicateUrlPatterns(wrongOrderUrl, patterns)).toBe(undefined);
    });

    test("handles multiple search params in pattern, to match a single search param regardless of the order", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "allow",
          pattern: new URLPattern({ pathname: "/report", search: "*role=admin*" }),
        },
      ];

      const url1 = new URL("https://example.com/report?role=admin");
      const url2 = new URL("https://example.com/report?year=2022&role=admin");
      const url3 = new URL("https://example.com/report?role=admin&year=2022");
      const url4 = new URL("https://example.com/report?location=nyc&role=admin&year=2022");
      const url5 = new URL("https://example.com/report?location=nyc&year=2022");

      expect(predicateUrlPatterns(url1, patterns)).toBe(true);
      expect(predicateUrlPatterns(url2, patterns)).toBe(true);
      expect(predicateUrlPatterns(url3, patterns)).toBe(true);
      expect(predicateUrlPatterns(url4, patterns)).toBe(true);
      expect(predicateUrlPatterns(url5, patterns)).toBe(undefined);
    });

    test("handles search pattern with wildcard for any search params", () => {
      const patterns: KnockGuideActivationUrlPattern[] = [
        {
          directive: "block",
          pattern: new URLPattern({ pathname: "/api", search: "*" }),
        },
      ];

      const urlWithSearch = new URL("https://example.com/api?key=value");
      const urlWithoutSearch = new URL("https://example.com/api");

      expect(predicateUrlPatterns(urlWithSearch, patterns)).toBe(false);
      expect(predicateUrlPatterns(urlWithoutSearch, patterns)).toBe(false);
    });
  });
});
