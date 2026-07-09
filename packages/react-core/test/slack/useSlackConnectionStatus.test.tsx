import type KnockClient from "@knocklabs/client";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useSlackConnectionStatus from "../../src/modules/slack/hooks/useSlackConnectionStatus";

// Utility to build a mock Knock instance with controllable slack.authCheck
const buildMockKnock = (authCheckImpl: () => Promise<unknown>) => {
  return {
    slack: {
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

// Mock translations hook so that t(key) returns key
vi.mock("../../src/modules/i18n", () => ({
  useTranslations: () => ({ t: (k: string) => k }),
}));

describe("useSlackConnectionStatus", () => {
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
      useSlackConnectionStatus(knock, channelId, tenantId),
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
      useSlackConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );
  });

  it("sets status to disconnected when the access token is not set (4xx)", async () => {
    const knock = buildMockKnock(() =>
      Promise.resolve({
        response: {
          status: 400,
          data: { message: "slackAccessTokenNotSet" },
        },
      }),
    );

    const { result } = renderHook(() =>
      useSlackConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );
  });

  it("sets error status and label for slack error", async () => {
    const knock = buildMockKnock(() =>
      Promise.resolve({ connection: { ok: false, error: "account_inactive" } }),
    );

    const { result } = renderHook(() =>
      useSlackConnectionStatus(knock, channelId, tenantId),
    );

    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("error"),
    );
    await waitFor(() =>
      expect(result.current.errorLabel).toBe("Account inactive"),
    );
  });

  it("re-checks the connection when the authenticated user changes", async () => {
    const authCheck = vi.fn(() =>
      Promise.resolve({ connection: { ok: true } }),
    );
    const buildKnockWithUser = (userId: string) =>
      ({
        slack: { authCheck },
        authStore: {
          state: { status: "authenticated", userId, userToken: undefined },
          subscribe: () => () => {},
        },
      }) as unknown as KnockClient;

    const { result, rerender } = renderHook(
      ({ knock }) => useSlackConnectionStatus(knock, channelId, tenantId),
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
