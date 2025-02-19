import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { expect } from "vitest";
// @ts-expect-error -- Something is wrong with the package, so this works for now
import type { AxeMatchers } from "vitest-axe/matchers";
// @ts-expect-error -- Something is wrong with the package, so this works for now
import * as matchers from "vitest-axe/matchers";

expect.extend(matchers);

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

afterEach(() => {
  cleanup();
});
