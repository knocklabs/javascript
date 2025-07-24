import { GuideData, GuideGroupData, SelectFilterParams } from "./types";

export const formatFilters = (filters: SelectFilterParams = {}) => {
  return [
    filters.key && `key=${filters.key}`,
    filters.type && `type=${filters.type}`,
  ]
    .filter((x) => x)
    .join(", ");
};

export const byKey = <T extends { key: string }>(items: T[]) => {
  return items.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});
};

const sortGuides = <T extends GuideData>(guides: T[]) => {
  return [...guides].sort(
    (a, b) =>
      new Date(a.inserted_at).getTime() - new Date(b.inserted_at).getTime(),
  );
};

// Prefixed with a special char to distinguish from the actual default group.
const MOCK_GROUP_KEY = "$default";

// Build a notional group to fall back on for ordering only without any limits.
// This is mostly for backward compatibility purposes.
export const mockDefaultGroup = (entries: GuideData[] = []) => {
  const now = new Date();

  return {
    __typename: "GuideGroup",
    key: MOCK_GROUP_KEY,
    display_sequence: sortGuides(entries).map((g) => g.key),
    display_interval: null,
    inserted_at: now.toISOString(),
    updated_at: now.toISOString(),
  } as GuideGroupData;
};
