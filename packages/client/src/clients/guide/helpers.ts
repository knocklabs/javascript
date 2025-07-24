import {
  GuideData,
  GuideGroupData,
  KnockGuide,
  SelectFilterParams,
} from "./types";

// Extends the map class to allow having metadata on it, which is used to record
// the guide group context for the selection result (though currently only a
// default global group is supported).
export class SelectionResult<K = number, V = KnockGuide> extends Map<K, V> {
  metadata: { guideGroup: GuideGroupData } | undefined;

  constructor() {
    super();
  }
}

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

// Default global guide group key.
const DEFAULT_GROUP_KEY = "default";

// Prefixed with a special char $ to distinguish from an actual default group.
const MOCK_DEFAULT_GROUP_KEY = "$default";

// Build a notional default group to fall back on in case there is none, only
// for safety as there should always be a default guide group created.
export const mockDefaultGroup = (entries: GuideData[] = []) => {
  const now = new Date();

  return {
    __typename: "GuideGroup",
    key: MOCK_DEFAULT_GROUP_KEY,
    display_sequence: sortGuides(entries).map((g) => g.key),
    display_interval: null,
    inserted_at: now.toISOString(),
    updated_at: now.toISOString(),
  } as GuideGroupData;
};

export const findDefaultGroup = (guideGroups: GuideGroupData[]) =>
  guideGroups.find(
    (group) =>
      group.key === DEFAULT_GROUP_KEY || group.key === MOCK_DEFAULT_GROUP_KEY,
  );
