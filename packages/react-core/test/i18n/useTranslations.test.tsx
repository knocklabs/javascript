import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";

import { KnockI18nProvider } from "../../src/modules/i18n/context";
import { useTranslations } from "../../src/modules/i18n/hooks";
import { locales } from "../../src/modules/i18n/languages";

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <KnockI18nProvider i18n={locales.en}>{children}</KnockI18nProvider>
);

describe("useTranslations", () => {
  it("returns translation for known key", () => {
    const { result } = renderHook(() => useTranslations(), { wrapper });

    expect(result.current.t("slackError" as unknown as never)).toBe("Error");
  });

  it("falls back to key when translation missing", () => {
    const { result } = renderHook(() => useTranslations(), { wrapper });

    expect(result.current.t("nonexistent" as unknown as never)).toBeUndefined();
  });
});
