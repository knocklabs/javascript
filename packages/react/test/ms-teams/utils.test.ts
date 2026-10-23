import { describe, expect, test } from "vitest";

import { sortByDisplayName } from "../../src/modules/ms-teams/utils";

describe("sortByDisplayName", () => {
  test("sorts items alphabetically by displayName", () => {
    const items = [
      { id: 1, displayName: "Charlie" },
      { id: 2, displayName: "alpha" },
      { id: 3, displayName: "Bravo" },
    ];

    const sorted = sortByDisplayName(items);
    expect(sorted.map((i) => i.displayName)).toEqual([
      "alpha",
      "Bravo",
      "Charlie",
    ]);
  });

  test("leaves the array it was given alone", () => {
    // Callers hand this the array returned by useMsTeamsTeams and
    // useMsTeamsChannels, and the latter points straight into SWR's cache.
    const items = [
      { id: 1, displayName: "Charlie" },
      { id: 2, displayName: "alpha" },
      { id: 3, displayName: "Bravo" },
    ];

    const sorted = sortByDisplayName(items);

    expect(items.map((i) => i.displayName)).toEqual([
      "Charlie",
      "alpha",
      "Bravo",
    ]);
    expect(sorted).not.toBe(items);
  });
});
