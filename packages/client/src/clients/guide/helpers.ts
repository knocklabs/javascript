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
export const DEFAULT_GROUP_KEY = "default";

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

export const checkIfInsideThrottleWindow = (
  timestamp: string,
  durationInSeconds: number,
) => {
  // 1. Parse the original timestamp string into a Date object.
  // Date.parse() handles ISO 8601 strings correctly and returns milliseconds since epoch.
  // This inherently handles timezones by converting everything to a universal time representation (UTC).
  const throttleWindowStartedDate = new Date(timestamp);

  // Check if the original timestamp string was valid
  if (isNaN(throttleWindowStartedDate.getTime())) {
    return false;
  }

  // 2. Calculate the future timestamp by adding the duration to the original timestamp.
  // Convert duration from seconds to milliseconds.
  const durationInMilliseconds = durationInSeconds * 1000;
  const futureTimestampMilliseconds =
    throttleWindowStartedDate.getTime() + durationInMilliseconds;

  // 3. Get the current timestamp in milliseconds since epoch.
  const currentTimestampMilliseconds = new Date().getTime();

  // 4. Compare the current timestamp with the calculated future timestamp.
  // Both are in milliseconds since epoch (UTC), so direct comparison is accurate
  // regardless of local timezones.
  return currentTimestampMilliseconds <= futureTimestampMilliseconds;
};
