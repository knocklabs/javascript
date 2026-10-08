import Knock, { FeedClientOptions } from "@knocklabs/client";
import { differenceInSeconds, intlFormatDistance, parseISO } from "date-fns";
import { secondsInQuarter, secondsInYear } from "date-fns/constants";
import { ReactNode } from "react";

import { BadgeCountType } from "./types";

export function formatBadgeCount(count: number): string | number {
  return count > 9 ? "9+" : count;
}

/**
 * Returns a string that describes the badge count and type.
 *
 * `all` = "12 notifications"
 * `unread` = "1 unread notification"
 * `unseen` = "7 unseen notifications"
 */
export function getBadgeAriaLabel(
  count: number,
  badgeCountType: BadgeCountType,
): string {
  const qualifier = badgeCountType === "all" ? "" : `${badgeCountType} `;
  const noun = count === 1 ? "notification" : "notifications";
  return `${count} ${qualifier}${noun}`;
}

export type FormatTimestampOptions = {
  locale?: string | string[];
};

export type TimestampFormatter = (
  ts: string,
  options?: FormatTimestampOptions,
) => string;

/**
 * Formats a timestamp as a human-readable relative time string.
 *
 * By default, this function skips the "quarter" unit for dates between 3 and 12
 * months old, using "X months ago" instead of "X quarters ago" for better
 * readability. For all other date ranges, the unit is chosen automatically.
 */
export function formatTimestamp(
  ts: string,
  options: FormatTimestampOptions = {},
): string {
  try {
    const parsedTs = parseISO(ts);
    const now = new Date();
    const elapsedSeconds = Math.abs(differenceInSeconds(parsedTs, now));

    // Mirrors the elapsed-seconds range in which date-fns would pick
    // "quarter", so every would-be quarter result is shown in months.
    const unit =
      elapsedSeconds >= secondsInQuarter && elapsedSeconds < secondsInYear
        ? "month"
        : undefined;

    const formatted = intlFormatDistance(parsedTs, now, {
      locale: options.locale,
      unit,
    });

    return formatted;
  } catch (_e) {
    return ts;
  }
}

export function toSentenceCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function renderNodeOrFallback(node: ReactNode, fallback: ReactNode) {
  return node !== undefined ? node : fallback;
}

/*
  Used to build a consistent key for the KnockFeedProvider so that React knows when
  to trigger a re-render of the context when a key property changes.
*/
export function feedProviderKey(
  userId: Knock["userId"],
  feedId: string,
  options: FeedClientOptions = {},
) {
  return [
    userId,
    feedId,
    options.source,
    options.tenant,
    options.has_tenant,
    options.archived,
  ]
    .filter((f) => f !== null && f !== undefined)
    .join("-");
}

/*
  Used to build a consistent key for the KnockSlackProvider so that React knows when
  to trigger a re-render of the context when a key property changes.
*/
export function slackProviderKey({
  userId,
  knockSlackChannelId,
  tenantId,
  connectionStatus,
  errorLabel,
}: {
  userId?: Knock["userId"];
  knockSlackChannelId: string;
  tenantId: string;
  connectionStatus: string;
  errorLabel: string | null;
}) {
  return [userId, knockSlackChannelId, tenantId, connectionStatus, errorLabel]
    .filter((f) => f !== null && f !== undefined)
    .join("-");
}

/*
  Used to build a consistent key for the KnockMsTeamsProvider so that React knows when
  to trigger a re-render of the context when a key property changes.
*/
export function msTeamsProviderKey({
  userId,
  knockMsTeamsChannelId,
  tenantId,
  connectionStatus,
  errorLabel,
}: {
  userId?: Knock["userId"];
  knockMsTeamsChannelId: string;
  tenantId: string;
  connectionStatus: string;
  errorLabel: string | null;
}) {
  return [userId, knockMsTeamsChannelId, tenantId, connectionStatus, errorLabel]
    .filter((f) => f !== null && f !== undefined)
    .join("-");
}
