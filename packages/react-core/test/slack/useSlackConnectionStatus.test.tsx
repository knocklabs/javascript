import type KnockClient from "@knocklabs/client";
import { act, renderHook, waitFor } from "@testing-library/react";
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

    // Wait for the re-check to resolve back to "connected" (which only happens
    // after the second authCheck resolves), then assert it ran again.
    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("connected"),
    );
    expect(authCheck).toHaveBeenCalledTimes(2);
  });

  it("ignores a superseded authCheck when the user switches mid-flight", async () => {
    // Same client/slack instance across the switch; only the auth store's userId
    // changes (an in-place re-auth), and the switch happens while the first
    // authCheck is still in flight (status is still "connecting").
    const makeAuthStore = (userId: string) => {
      let state = { status: "authenticated", userId, userToken: undefined };
      const listeners = new Set<() => void>();
      return {
        get state() {
          return state;
        },
        subscribe(cb: () => void) {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        setUserId(next: string) {
          state = { ...state, userId: next };
          listeners.forEach((cb) => cb());
        },
      };
    };

    const resolvers: Array<(v: unknown) => void> = [];
    const authCheck = vi.fn(
      () => new Promise((resolve) => resolvers.push(resolve)),
    );
    const authStore = makeAuthStore("user_A");
    const knock = { slack: { authCheck }, authStore } as unknown as KnockClient;

    const { result } = renderHook(() =>
      useSlackConnectionStatus(knock, channelId, tenantId),
    );

    // First check is in flight for user_A; status is still "connecting".
    await waitFor(() => expect(authCheck).toHaveBeenCalledTimes(1));
    expect(result.current.connectionStatus).toBe("connecting");

    // Switch user while the first check is in flight (status stays "connecting",
    // so only the userId dep can drive the re-check).
    act(() => authStore.setUserId("user_B"));
    await waitFor(() => expect(authCheck).toHaveBeenCalledTimes(2));

    // user_B resolves first -> disconnected.
    await act(async () => {
      resolvers[1]!({ connection: { ok: false } });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );

    // The superseded user_A check resolves late; its result must be ignored, so
    // the status stays "disconnected" rather than latching to "connected".
    await act(async () => {
      resolvers[0]!({ connection: { ok: true } });
      await Promise.resolve();
    });
    expect(result.current.connectionStatus).toBe("disconnected");
  });

  it("ignores a superseded authCheck that rejects after the user switches mid-flight", async () => {
    // Same setup as the test above, but the stale (user_A) check *rejects*
    // instead of resolving. The late rejection must be swallowed so the status
    // stays with user_B's result rather than flipping to "error".
    const makeAuthStore = (userId: string) => {
      let state = { status: "authenticated", userId, userToken: undefined };
      const listeners = new Set<() => void>();
      return {
        get state() {
          return state;
        },
        subscribe(cb: () => void) {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        setUserId(next: string) {
          state = { ...state, userId: next };
          listeners.forEach((cb) => cb());
        },
      };
    };

    const resolvers: Array<(v: unknown) => void> = [];
    const rejecters: Array<(e: unknown) => void> = [];
    const authCheck = vi.fn(
      () =>
        new Promise((resolve, reject) => {
          resolvers.push(resolve);
          rejecters.push(reject);
        }),
    );
    const authStore = makeAuthStore("user_A");
    const knock = { slack: { authCheck }, authStore } as unknown as KnockClient;

    const { result } = renderHook(() =>
      useSlackConnectionStatus(knock, channelId, tenantId),
    );

    // First check is in flight for user_A; status is still "connecting".
    await waitFor(() => expect(authCheck).toHaveBeenCalledTimes(1));
    expect(result.current.connectionStatus).toBe("connecting");

    // Switch user while the first check is in flight, superseding user_A.
    act(() => authStore.setUserId("user_B"));
    await waitFor(() => expect(authCheck).toHaveBeenCalledTimes(2));

    // user_B resolves first -> disconnected.
    await act(async () => {
      resolvers[1]!({ connection: { ok: false } });
      await Promise.resolve();
    });
    await waitFor(() =>
      expect(result.current.connectionStatus).toBe("disconnected"),
    );

    // The superseded user_A check rejects late; the error must be ignored, so
    // the status stays "disconnected" rather than latching to "error".
    await act(async () => {
      rejecters[0]!(new Error("network blip"));
      await Promise.resolve();
    });
    expect(result.current.connectionStatus).toBe("disconnected");
  });
});
