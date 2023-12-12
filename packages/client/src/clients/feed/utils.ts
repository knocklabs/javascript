import { FeedItem } from "./interfaces";

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
