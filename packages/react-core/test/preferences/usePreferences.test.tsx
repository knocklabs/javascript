import type { SetPreferencesProperties } from "@knocklabs/client";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePreferences } from "../../src/modules/preferences/hooks/usePreferences";

// ----------------------------------------------------------------------------------
// Shared mocks & helpers
// ----------------------------------------------------------------------------------

// Stub SWR mutate so we can assert calls
const mutateMock = vi.fn();

// Shared preferences payload used across tests and SWR mock.
// Define it with `let` so it exists in temporal scope before initialization.
let DEFAULT_PREFERENCES: Readonly<SetPreferencesProperties & { id?: string }>;

// We'll assign the actual value *before* our tests run (see below). This avoids
// the Temporal Dead Zone issue when the SWR mock factory is evaluated early by
// Vitest's hoisting mechanism.

// Build an SWR mock factory that invokes the provided fetcher so we can assert
// that Knock.user.getPreferences is executed.
function buildSWRMock() {
  return {
    __esModule: true,
    default: (key: unknown, fetcher?: () => Promise<unknown>) => {
      // SWR will only invoke the fetcher when the key is non-null.
      if (key && typeof fetcher === "function") {
        // The real SWR implementation would call the fetcher and store the
        // promise result – we don't need the result here, just the side-effect
        // for our assertions.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetcher();
      }

      return {
        // Provide a dynamic getter so we don't evaluate `DEFAULT_PREFERENCES`
        // before it has been initialised.
        get data() {
          return DEFAULT_PREFERENCES;
        },
        mutate: mutateMock,
        isLoading: false,
        isValidating: false,
      };
    },
  };
}

vi.mock("swr", () => buildSWRMock());

// ----------------------------------------------------------------------------------
// Mock Knock client and surrounding hooks
// ----------------------------------------------------------------------------------

// We'll define these mocks now and (re)assign their resolved values once
// `DEFAULT_PREFERENCES` is initialised.
const mockGetPreferences = vi.fn();
const mockSetPreferences = vi.fn().mockResolvedValue(undefined);
const mockGetAllPreferences = vi.fn().mockResolvedValue({ all: true });

// Declare the variable without immediate initialization to avoid TDZ issues
let useKnockClientMock: ReturnType<typeof vi.fn>;

vi.mock("../../src/modules/core", () => ({
  useKnockClient: (...args: unknown[]) => useKnockClientMock(...args),
}));

function createKnockClient({ userId = "user_1" } = {}) {
  return {
    userId,
    user: {
      getPreferences: mockGetPreferences,
      setPreferences: mockSetPreferences,
      getAllPreferences: mockGetAllPreferences,
    },
  } as const;
}

// ----------------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------------

describe("usePreferences", () => {
  // Prepare mocks and shared data before each test
  beforeEach(() => {
    vi.clearAllMocks();

    DEFAULT_PREFERENCES = {
      workflows: {},
      categories: {
        email: {
          channel_types: { email: true, in_app_feed: true },
        },
      },
      channel_types: {},
    };

    mockGetPreferences.mockResolvedValue(DEFAULT_PREFERENCES);

    // Provide a fresh mocked Knock client for each test run
    useKnockClientMock = vi.fn();
    useKnockClientMock.mockReturnValue(createKnockClient());
  });

  it("returns preference data and loading flags from SWR", () => {
    const { result } = renderHook(() =>
      usePreferences({ preferenceSet: "marketing", tenant: "tenant_1" }),
    );

    expect(result.current.preferences).toEqual(DEFAULT_PREFERENCES);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isValidating).toBe(false);

    // The SWR mock calls the fetcher immediately, so Knock.user.getPreferences
    // should have been invoked with the provided options
    expect(mockGetPreferences).toHaveBeenCalledWith({
      preferenceSet: "marketing",
      tenant: "tenant_1",
    });
  });

  it("exposes a setPreferences helper that forwards calls to Knock and triggers mutate", async () => {
    const { result } = renderHook(() =>
      usePreferences({ preferenceSet: "marketing" }),
    );

    const newPreferences: SetPreferencesProperties = {
      workflows: {},
      categories: {
        sms: { channel_types: { sms: true } },
      },
      channel_types: {},
    };

    await act(async () => {
      result.current.setPreferences(newPreferences);
    });

    expect(mockSetPreferences).toHaveBeenCalledWith(newPreferences, {
      preferenceSet: "marketing",
    });
    expect(mutateMock).toHaveBeenCalled();
  });

  it("exposes getAllPreferences helper that proxies to Knock.user.getAllPreferences", async () => {
    const { result } = renderHook(() => usePreferences());

    await act(async () => {
      await result.current.getAllPreferences();
    });

    expect(mockGetAllPreferences).toHaveBeenCalled();
  });

  it("does not fetch preferences when there is no authenticated user", () => {
    // Override useKnockClient to return a client with no userId
    useKnockClientMock.mockReturnValue(
      createKnockClient({ userId: null as unknown as undefined }),
    );

    const callsBefore = mockGetPreferences.mock.calls.length;

    renderHook(() => usePreferences());

    expect(mockGetPreferences.mock.calls.length).toBe(callsBefore);
  });
});
