import type { FeedClientOptions, FeedItem } from "./interfaces";

export function deduplicateItems(items: FeedItem[]): FeedItem[] {
  const seen: Record<string, boolean> = {};
  const values: FeedItem[] = [];

  return items.reduce((acc, item) => {
    if (seen[item.id]) {
      return acc;
    }

    seen[item.id] = true;
    return [...acc, item];
  }, values);
}

export function sortItems(items: FeedItem[]) {
  return items.sort((a, b) => {
    return (
      new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime()
    );
  });
}

export function mergeDateRangeParams(options: FeedClientOptions) {
  const { inserted_at_date_range, ...rest } = options;

  if (!inserted_at_date_range) {
    return rest;
  }

  const dateRangeParams: Record<string, string> = {};

  // Determine which operators to use based on the inclusive flag
  const isInclusive = inserted_at_date_range.inclusive ?? false;

  // For start date: use gte if inclusive, gt if not
  if (inserted_at_date_range.start) {
    const startOperator = isInclusive ? "inserted_at.gte" : "inserted_at.gt";
    dateRangeParams[startOperator] = inserted_at_date_range.start;
  }

  // For end date: use lte if inclusive, lt if not
  if (inserted_at_date_range.end) {
    const endOperator = isInclusive ? "inserted_at.lte" : "inserted_at.lt";
    dateRangeParams[endOperator] = inserted_at_date_range.end;
  }

  return { ...rest, ...dateRangeParams };
}

// If the trigger data is an object, stringify it to conform to API expectations
// https://docs.knock.app/reference#get-feed
// We also want to be careful to check for string values already,
// because this was a bug (KNO-7843) and customers had to manually stringify their trigger data
export function getFormattedTriggerData(options: FeedClientOptions) {
  // If the trigger data is an object, stringify it to conform to API expectations
  if (typeof options?.trigger_data === "object") {
    return JSON.stringify(options.trigger_data);
  }

  // For when the trigger data is already formatted as a string by the user
  if (typeof options?.trigger_data === "string") {
    return options.trigger_data;
  }

  return undefined;
}

export function getFormattedExclude(options: FeedClientOptions) {
  if (!options?.exclude?.length) {
    return undefined;
  }

  return options.exclude
    .map((field) => field.trim())
    .filter((field) => !!field)
    .join(",");
}
