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

// -----------------------------------------------------------------------------
// Commonly used mock helpers to avoid duplication across tests
// -----------------------------------------------------------------------------

/**
 * Sets up a default mock for useKnockMsTeamsClient returning a fixed set of
 * ids + a 'connected' status. You can override any fields by passing an
 * overrides object.
 */
export const mockMsTeamsContext = (
  overridesInput: Partial<{
    knockMsTeamsChannelId: string;
    tenantId: string;
    connectionStatus: string;
    setConnectionStatus: (s: unknown) => void;
    errorLabel: string | null;
    setErrorLabel: (l: unknown) => void;
    actionLabel: string | null;
    setActionLabel: (l: unknown) => void;
  }> = {},
): void => {
  Object.assign(msTeamsClientOverrides, overridesInput);
};

/**
 * Simple translation mock so tests can rely on t(key) => key without importing
 * real language bundles.
 */
export const mockTranslations = () => {
  vi.mock("../../src/modules/i18n", () => ({
    useTranslations: () => ({ t: (k: string) => k }),
  }));
};

// ---------------------------------------------------------------------------
// Internal: manage a shared overrides object to satisfy Vitest hoisting.
// ---------------------------------------------------------------------------

// This object is mutated by mockMsTeamsContext **before** hooks are imported
// inside individual test files. The mocked context below always reads from the
// latest value so tests receive the correct overrides.
const msTeamsClientOverrides: Partial<{
  knockMsTeamsChannelId: string | null;
  tenantId: string | null;
  connectionStatus: string;
  setConnectionStatus: (status: string) => void;
  errorLabel: string | null;
  setErrorLabel: (label: string | null) => void;
  actionLabel: string | null;
  setActionLabel: (label: string | null) => void;
}> = {};

// Register the mock once at module evaluation (hoisted by Vitest).
vi.mock("../../src/modules/ms-teams/context", () => {
  const createState = () => ({
    knockMsTeamsChannelId: "knock_chan",
    tenantId: "tenant_1",
    connectionStatus: "connected",
    setConnectionStatus: vi.fn(),
    errorLabel: null,
    setErrorLabel: vi.fn(),
    actionLabel: null,
    setActionLabel: vi.fn(),
    ...msTeamsClientOverrides,
  });

  return {
    useKnockMsTeamsClient: () => createState(),
  };
});

vi.mock("../../src/modules/ms-teams", () => {
  const createState = () => ({
    knockMsTeamsChannelId: "knock_chan",
    tenantId: "tenant_1",
    connectionStatus: "connected",
    setConnectionStatus: vi.fn(),
    errorLabel: null,
    setErrorLabel: vi.fn(),
    actionLabel: null,
    setActionLabel: vi.fn(),
    ...msTeamsClientOverrides,
  });

  return {
    useKnockMsTeamsClient: () => createState(),
  };
});
