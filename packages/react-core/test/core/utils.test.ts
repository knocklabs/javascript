import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  feedProviderKey,
  formatBadgeCount,
  formatTimestamp,
  getBadgeAriaLabel,
  msTeamsProviderKey,
  renderNodeOrFallback,
  slackProviderKey,
  toSentenceCase,
} from "../../src";
import { FilterStatus } from "../../src/modules/core/constants";

describe("formatBadgeCount", () => {
  test("returns count when count is less than 10", () => {
    expect(formatBadgeCount(9)).toBe(9);
    expect(formatBadgeCount(5)).toBe(5);
    expect(formatBadgeCount(0)).toBe(0);
  });

  test("returns 9+ when count is greater than 9", () => {
    expect(formatBadgeCount(10)).toBe("9+");
    expect(formatBadgeCount(100)).toBe("9+");
  });
});

describe("getBadgeAriaLabel", () => {
  test("uses singular 'notification' when count is 1", () => {
    expect(getBadgeAriaLabel(1, "unseen")).toBe("1 unseen notification");
    expect(getBadgeAriaLabel(1, "unread")).toBe("1 unread notification");
    expect(getBadgeAriaLabel(1, "all")).toBe("1 notification");
  });

  test("uses plural 'notifications' when count is not 1", () => {
    expect(getBadgeAriaLabel(0, "unseen")).toBe("0 unseen notifications");
    expect(getBadgeAriaLabel(3, "unseen")).toBe("3 unseen notifications");
    expect(getBadgeAriaLabel(5, "unread")).toBe("5 unread notifications");
    expect(getBadgeAriaLabel(10, "all")).toBe("10 notifications");
  });
});

describe("formatTimestamp", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("it formats dates correctly with a default locale", () => {
    const now = new Date();
    vi.setSystemTime(now);

    expect(formatTimestamp(now.toISOString())).toBe("now");

    const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
    expect(formatTimestamp(tenSecondsAgo.toISOString())).toBe("10 seconds ago");

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatTimestamp(fiveMinutesAgo.toISOString())).toBe("5 minutes ago");

    const sixDaygAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    expect(formatTimestamp(sixDaygAgo.toISOString())).toBe("6 days ago");

    const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
    expect(formatTimestamp(twoWeeksAgo.toISOString())).toBe("2 weeks ago");
  });

  test("it formats dates correctly in spanish", () => {
    const locale = "es";
    const now = new Date();
    vi.setSystemTime(now);

    expect(
      formatTimestamp(now.toISOString(), {
        locale,
      }),
    ).toBe("ahora");

    const tenSecondsAgo = new Date(now.getTime() - 10 * 1000);
    expect(
      formatTimestamp(tenSecondsAgo.toISOString(), {
        locale,
      }),
    ).toBe("hace 10 segundos");

    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(
      formatTimestamp(fiveMinutesAgo.toISOString(), {
        locale,
      }),
    ).toBe("hace 5 minutos");

    const sixDaygAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    expect(
      formatTimestamp(sixDaygAgo.toISOString(), {
        locale,
      }),
    ).toBe("hace 6 días");

    const twoWeeksAgo = new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000);
    expect(
      formatTimestamp(twoWeeksAgo.toISOString(), {
        locale,
      }),
    ).toBe("hace 2 semanas");
  });

  test("it uses months instead of quarters for dates 3-12 months old", () => {
    // Set a fixed date: Oct 8, 2026 at noon
    const now = new Date(2026, 9, 8, 12, 0, 0);
    vi.setSystemTime(now);

    // 3 months ago: should show "3 months ago" instead of "last quarter"
    const threeMonthsAgo = new Date(2026, 6, 8, 12, 0, 0);
    expect(formatTimestamp(threeMonthsAgo.toISOString())).toBe("3 months ago");

    // 5 months ago: should show "5 months ago" instead of "2 quarters ago"
    const fiveMonthsAgo = new Date(2026, 4, 8, 12, 0, 0);
    expect(formatTimestamp(fiveMonthsAgo.toISOString())).toBe("5 months ago");

    // 9 months ago: should show "9 months ago" instead of "3 quarters ago"
    const nineMonthsAgo = new Date(2026, 0, 8, 12, 0, 0);
    expect(formatTimestamp(nineMonthsAgo.toISOString())).toBe("9 months ago");

    // 11 months ago: should show "11 months ago" instead of "4 quarters ago"
    const elevenMonthsAgo = new Date(2025, 10, 8, 12, 0, 0);
    expect(formatTimestamp(elevenMonthsAgo.toISOString())).toBe("11 months ago");
  });

  test("it allows automatic unit selection for dates less than 3 months old", () => {
    // Set a fixed date: Oct 8, 2026 at noon
    const now = new Date(2026, 9, 8, 12, 0, 0);
    vi.setSystemTime(now);

    // 2 months ago: should use automatic unit selection ("2 months ago")
    const twoMonthsAgo = new Date(2026, 7, 8, 12, 0, 0);
    expect(formatTimestamp(twoMonthsAgo.toISOString())).toBe("2 months ago");
  });

  test("it uses months for dates exactly 12 months old to avoid quarter bug", () => {
    // Set a fixed date: Oct 8, 2026 at noon
    const now = new Date(2026, 9, 8, 12, 0, 0);
    vi.setSystemTime(now);

    // 12 months ago: should show "12 months ago" (not "4 quarters ago")
    // Note: date-fns has a bug where this would show "4 quarters ago"
    // if we didn't force the "month" unit.
    const twelveMonthsAgo = new Date(2025, 9, 8, 12, 0, 0);
    expect(formatTimestamp(twelveMonthsAgo.toISOString())).toBe("12 months ago");
  });

  test("it allows automatic unit selection for dates 13+ months old", () => {
    // Set a fixed date: Oct 8, 2026 at noon
    const now = new Date(2026, 9, 8, 12, 0, 0);
    vi.setSystemTime(now);

    // 13 months ago: should use automatic unit selection ("last year")
    const thirteenMonthsAgo = new Date(2025, 8, 8, 12, 0, 0);
    expect(formatTimestamp(thirteenMonthsAgo.toISOString())).toBe("last year");

    // 2 years ago: should show "2 years ago"
    const twoYearsAgo = new Date(2024, 9, 8, 12, 0, 0);
    expect(formatTimestamp(twoYearsAgo.toISOString())).toBe("2 years ago");
  });

  test("it uses months instead of quarters in spanish", () => {
    const locale = "es";
    // Set a fixed date: Oct 8, 2026 at noon
    const now = new Date(2026, 9, 8, 12, 0, 0);
    vi.setSystemTime(now);

    // 5 months ago in Spanish
    const fiveMonthsAgo = new Date(2026, 4, 8, 12, 0, 0);
    expect(formatTimestamp(fiveMonthsAgo.toISOString(), { locale })).toBe(
      "hace 5 meses",
    );
  });
});

// ----------------------------------------------------------------------------------
// Additional utility function tests
// ----------------------------------------------------------------------------------

describe("toSentenceCase", () => {
  test("capitalizes the first character and leaves the rest untouched", () => {
    expect(toSentenceCase("hello world")).toBe("Hello world");
    expect(toSentenceCase("h")).toBe("H");
    expect(toSentenceCase("Already capitalized")).toBe("Already capitalized");
  });
});

describe("renderNodeOrFallback", () => {
  test("returns the node when it is defined", () => {
    const node = "primary";
    const fallback = "fallback";
    expect(renderNodeOrFallback(node, fallback)).toBe(node);
  });

  test("returns the fallback when the node is undefined", () => {
    const fallback = "fallback";
    expect(renderNodeOrFallback(undefined, fallback)).toBe(fallback);
  });
});

describe("provider key helpers", () => {
  test("feedProviderKey joins defined segments with dashes", () => {
    const key = feedProviderKey("user1", "feed1", {
      source: "web",
      tenant: "tenant1",
      has_tenant: true,
      archived: "exclude",
    });
    expect(key).toBe("user1-feed1-web-tenant1-true-exclude");
  });

  test("slackProviderKey omits null/undefined values", () => {
    const key = slackProviderKey({
      knockSlackChannelId: "chan",
      tenantId: "tenant",
      connectionStatus: "connected",
      errorLabel: null,
    });
    // Should not include trailing dash for null errorLabel
    expect(key).toBe("chan-tenant-connected");
  });

  test("msTeamsProviderKey handles all values", () => {
    const key = msTeamsProviderKey({
      knockMsTeamsChannelId: "chan",
      tenantId: "tenant",
      connectionStatus: "connecting",
      errorLabel: "Oops",
    });
    expect(key).toBe("chan-tenant-connecting-Oops");
  });
});

describe("FilterStatus enum", () => {
  test("contains the expected string values", () => {
    expect(FilterStatus.All).toBe("all");
    expect(FilterStatus.Read).toBe("read");
    expect(FilterStatus.Unseen).toBe("unseen");
    expect(FilterStatus.Unread).toBe("unread");
  });
});
