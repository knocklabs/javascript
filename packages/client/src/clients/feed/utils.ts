import { FeedClientOptions, FeedItem } from "./interfaces";

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

function formatInsertedAtDateRange(insertedAtDateRange?: { start?: string, end?: string, inclusive?: boolean }) {
  if (!insertedAtDateRange) {
    return {};
  }

  // Create a properly typed object for our date filter parameters
  const dateRangeParams: Record<string, string> = {};

  // Determine which operators to use based on the inclusive flag
  const isInclusive = insertedAtDateRange.inclusive ?? false;

  // For start date: use gte if inclusive, gt if not
  if (insertedAtDateRange.start) {
    const startOperator = isInclusive
      ? "inserted_at.gte"
      : "inserted_at.gt";
    dateRangeParams[startOperator] = insertedAtDateRange.start;
  }

  // For end date: use lte if inclusive, lt if not
  if (insertedAtDateRange.end) {
    const endOperator = isInclusive ? "inserted_at.lte" : "inserted_at.lt";
    dateRangeParams[endOperator] = insertedAtDateRange.end;
  }

  return dateRangeParams;
}

export function formatOptionsForApi(options: FeedClientOptions) {
  const { inserted_at_date_range, ...rest } = options;

  const dateRangeParams = formatInsertedAtDateRange(inserted_at_date_range);

  return { ...rest, ...dateRangeParams };
}
