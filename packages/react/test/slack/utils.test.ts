import type { SlackChannel } from "@knocklabs/client";
import { describe, expect, test } from "vitest";

import { sortSlackChannelsAlphabetically } from "../../src/modules/slack/utils";

describe("sortSlackChannelsAlphabetically", () => {
  test("sorts channels case-insensitively", () => {
    const channels = [
      { id: "1", name: "alpha" },
      { id: "2", name: "Zulu" },
      { id: "3", name: "bravo" },
    ];

    const sorted = sortSlackChannelsAlphabetically(channels as SlackChannel[]);
    expect(sorted.map((c) => c.name)).toEqual(["alpha", "bravo", "Zulu"]);
  });
});
