import { describe, expect, test } from "vitest";

import * as ReactPackage from "../../src";

// List of key exports we expect to be forwarded
const expectedExports = [
  "Button",
  "Spinner",
  "NotificationFeed",
  "NotificationIconButton",
  "UnseenBadge",
];

describe("Public API barrel exports", () => {
  test.each(expectedExports)("%s is exported", (exportName) => {
    expect(ReactPackage[exportName as keyof typeof ReactPackage]).toBeDefined();
  });
});
