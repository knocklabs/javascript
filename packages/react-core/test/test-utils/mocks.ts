// NOTE: Add react-core-specific mock helpers below as needed.
import { vi } from "vitest";

// Re-export the comprehensive mocks & helpers that already exist for the
// @knocklabs/client package so we don't duplicate effort.
// Any React-core-specific shims can be added alongside the re-exports.

export * from "../../../client/test/test-utils/mocks";

// -----------------------------------------------------------------------------
// Global console silencer to keep test output clean
// -----------------------------------------------------------------------------

console.warn = vi.fn();

// -----------------------------------------------------------------------------
// Shared helper utilities for react-core tests
// -----------------------------------------------------------------------------

/**
 * Resets vitest mocks, modules, and timers for a clean slate between specs.
 */
export const resetTestingState = () => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.useRealTimers();
};

/**
 * Builds a deterministic SWR Infinite mock that returns the supplied page data.
 * Useful for Slack / Ms-Teams channel hooks that rely on pagination.
 */
export const createInfiniteSWRMock = (
  pages: unknown[],
  {
    loading = false,
    validating = false,
  }: { loading?: boolean; validating?: boolean } = {},
) => {
  const setSize = vi.fn();
  const mutate = vi.fn();

  return {
    __esModule: true,
    default: () => ({
      data: pages,
      error: undefined,
      isLoading: loading,
      isValidating: validating,
      setSize,
      mutate,
    }),
  };
};
