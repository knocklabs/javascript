import { describe, expect, test } from "vitest";

import * as ReactPackage from "../../src";

// List of key exports we expect to be forwarded
const expectedExports = [
  "Button",
  "Spinner",
  "NotificationFeed",
  "NotificationIconButton",
  "UnseenBadge",
  // Hooks forwarded from @knocklabs/react-core (this package curates its exports
  // by name, so a missing forward is otherwise invisible to type-check).
  "useKnockClient",
  "useKnockAuthState",
];

describe("Public API barrel exports", () => {
  test.each(expectedExports)("%s is exported", (exportName) => {
    expect(ReactPackage[exportName as keyof typeof ReactPackage]).toBeDefined();
  });
});
