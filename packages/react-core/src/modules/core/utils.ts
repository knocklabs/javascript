import Knock, { FeedClientOptions } from "@knocklabs/client";
import { intlFormatDistance, parseISO } from "date-fns";
import { ReactNode } from "react";

export function formatBadgeCount(count: number): string | number {
  return count > 9 ? "9+" : count;
}

type FormatTimestampOptions = {
  locale?: string | string[];
};

export function formatTimestamp(
  ts: string,
  options: FormatTimestampOptions = {},
) {
  try {
    const parsedTs = parseISO(ts);
    const formatted = intlFormatDistance(parsedTs, new Date(), {
      locale: options.locale,
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
  knockSlackChannelId,
  tenantId,
  connectionStatus,
  errorLabel,
}: {
  knockSlackChannelId: string;
  tenantId: string;
  connectionStatus: string;
  errorLabel: string | null;
}) {
  return [knockSlackChannelId, tenantId, connectionStatus, errorLabel]
    .filter((f) => f !== null && f !== undefined)
    .join("-");
}

/*
  Used to build a consistent key for the KnockMsTeamsProvider so that React knows when
  to trigger a re-render of the context when a key property changes.
*/
export function msTeamsProviderKey({
  knockMsTeamsChannelId,
  tenantId,
  connectionStatus,
  errorLabel,
}: {
  knockMsTeamsChannelId: string;
  tenantId: string;
  connectionStatus: string;
  errorLabel: string | null;
}) {
  return [knockMsTeamsChannelId, tenantId, connectionStatus, errorLabel]
    .filter((f) => f !== null && f !== undefined)
    .join("-");
}
