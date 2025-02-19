import { expect } from "vitest";
// @ts-expect-error -- Something is wrong with the package, so this works for now
import { type AxeCore, axe } from "vitest-axe";
// @ts-expect-error -- Something is wrong with the package, so this works for now
import { toHaveNoViolations as fn } from "vitest-axe/matchers";

// Helper to check for a11y violations while keeping type safety
export const expectToHaveNoViolations = (element: AxeCore.AxeResults) => {
  expect(fn(element).pass).toBe(true);
};

export { axe };
