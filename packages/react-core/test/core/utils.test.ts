import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
  feedProviderKey,
  formatBadgeCount,
  formatTimestamp,
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
