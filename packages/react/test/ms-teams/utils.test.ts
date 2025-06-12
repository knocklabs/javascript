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
});
