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

// If the trigger data is an object, stringify it to conform to API expectations
// BEFORE:  { isEnterprise: true }
// AFTER:  "{\"isEnterprise\":true}"
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
