import { describe, expect, it } from "vitest";

import { locales } from "../../src/modules/i18n/languages";

describe("i18n language bundles", () => {
  it("exports english and german locales", () => {
    expect(locales.en.locale).toBe("en");
    expect(locales.de.locale).toBe("de");
  });

  it("english bundle contains expected keys", () => {
    const keys = Object.keys(locales.en.translations ?? {});
    expect(keys).toContain("slackConnect");
    expect(keys.length).toBeGreaterThan(10);
  });

  it("german bundle is a subset of english keys (no superfluous keys)", () => {
    const enKeys = new Set(Object.keys(locales.en.translations ?? {}));
    const deKeys = Object.keys(locales.de.translations ?? {});

    // Every german key must exist in english bundle as well
    const missing = deKeys.filter((k) => !enKeys.has(k));
    expect(missing).toHaveLength(0);
  });
});
