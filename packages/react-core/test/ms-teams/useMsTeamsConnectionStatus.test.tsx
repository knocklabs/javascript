import type KnockClient from "@knocklabs/client";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMsTeamsConnectionStatus from "../../src/modules/ms-teams/hooks/useMsTeamsConnectionStatus";

// -----------------------------------------------------------------------------
// Helper to build a minimal Knock mock with a controllable msTeams.authCheck impl
// -----------------------------------------------------------------------------
const buildMockKnock = (authCheckImpl: () => Promise<unknown>) => {
  return {
    msTeams: {
      authCheck: vi.fn(authCheckImpl),
    },
    // Minimal subscribable auth store so `useKnockAuthState` can read the userId.
    authStore: {
      state: {
        status: "authenticated",
        userId: "user_1",
        userToken: undefined,
      },
      subscribe: () => () => {},
    },
  } as unknown as KnockClient;
};

// Mock translations so that t(key) simply returns the key back which allows us
// to test against string equality without managing translation dictionaries.
vi.mock("../../src/modules/i18n", () => ({
  useTranslations: () => ({ t: (k: string) => k }),
}));

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("useMsTeamsConnectionStatus", () => {
  const tenantId = "tenant_1";
  const channelId = "chan_1";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sets status to connected when authCheck ok", async () => {
    const knock = buildMockKnock(() =>
      Promise.resolve({ connection: { ok: true } }),
    );

    const { result } = renderHook(() =>
      useMsTeamsConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("connected"),
    );
  });

  it("sets status to disconnected when not ok and no error", async () => {
    const knock = buildMockKnock(() =>
      Promise.resolve({ connection: { ok: false } }),
    );

    const { result } = renderHook(() =>
      useMsTeamsConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );
  });

  it("sets status to disconnected when the tenant id is not set (4xx)", async () => {
    const knock = buildMockKnock(() =>
      Promise.resolve({
        response: {
          status: 400,
          data: { message: "msTeamsTenantIdNotSet" },
        },
      }),
    );

    const { result } = renderHook(() =>
      useMsTeamsConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );
  });

  it("sets status to error when authCheck throws", async () => {
    const knock = buildMockKnock(() => Promise.reject(new Error("failure")));

    const { result } = renderHook(() =>
      useMsTeamsConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() => expect(result.current.connectionStatus).toBe("error"));
  });

  it("re-checks the connection when the authenticated user changes", async () => {
    const authCheck = vi.fn(() =>
      Promise.resolve({ connection: { ok: true } }),
    );
    const buildKnockWithUser = (userId: string) =>
      ({
        msTeams: { authCheck },
        authStore: {
          state: { status: "authenticated", userId, userToken: undefined },
          subscribe: () => () => {},
        },
      }) as unknown as KnockClient;

    const { result, rerender } = renderHook(
      ({ knock }) => useMsTeamsConnectionStatus(knock, channelId, tenantId),
      { initialProps: { knock: buildKnockWithUser("user_A") } },
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("connected"),
    );
    expect(authCheck).toHaveBeenCalledTimes(1);

    // Switching users must reset the latched status and re-run authCheck.
    rerender({ knock: buildKnockWithUser("user_B") });

    await waitFor(() => expect(authCheck).toHaveBeenCalledTimes(2));
    expect(result.current.connectionStatus).toBe("connected");
  });
});
