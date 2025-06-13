import { expect } from "vitest";
import { type AxeCore, axe } from "vitest-axe";
// @ts-expect-error – vitest-axe typing quirk
import { toHaveNoViolations as fn } from "vitest-axe/matchers";

export const expectToHaveNoViolations = (element: AxeCore.AxeResults) => {
  expect(fn(element).pass).toBe(true);
};

export { axe };

// JSDOM doesn't implement canvas; axe uses it for color-contrast rule
