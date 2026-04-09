import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import useSlackAuth from "../../src/modules/slack/hooks/useSlackAuth";
import { getSlackNonceStorageKey } from "../../src/modules/slack/hooks/useSlackAuth";

const TEST_BRANCH_SLUG = "lorem-ipsum-branch";

const mockRandomUUID = vi.fn(() => "test-nonce-uuid");
vi.stubGlobal("crypto", { randomUUID: mockRandomUUID });

const mockSessionStorage = (() => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key in store) delete store[key];
    }),
  };
})();
vi.stubGlobal("sessionStorage", mockSessionStorage);

const mockSetConnectionStatus = vi.fn();
const mockSetActionLabel = vi.fn();

vi.mock("../../src/modules/slack", () => ({
  useKnockSlackClient: () => ({
    setConnectionStatus: mockSetConnectionStatus,
    setActionLabel: mockSetActionLabel,
    knockSlackChannelId: "test_channel_id",
    tenantId: "test_tenant_id",
  }),
}));

const mockSlackClient = {
  revokeAccessToken: vi.fn(),
};

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    slack: mockSlackClient,
    apiKey: "test_api_key",
    userToken: "test_user_token",
    branch: TEST_BRANCH_SLUG,
  }),
}));

describe("useSlackAuth", () => {
  test("buildSlackAuthUrl returns the correct URL with default scopes", () => {
    const { result } = renderHook(() =>
      useSlackAuth("test_client_id", "http://localhost:3000"),
    );

    const url = new URL(result.current.buildSlackAuthUrl());
    const params = new URLSearchParams(url.search);
    const state = JSON.parse(params.get("state") || "{}");

    expect(url.origin + url.pathname).toBe(
      "https://slack.com/oauth/v2/authorize",
    );
    expect(params.get("client_id")).toBe("test_client_id");
    expect(params.get("scope")).toBe(
      "chat:write,chat:write.public,channels:read,groups:read",
    );
    expect(state).toEqual({
      nonce: "test-nonce-uuid",
      redirect_url: "http://localhost:3000",
      access_token_object: {
        object_id: "test_tenant_id",
        collection: "$tenants",
      },
      channel_id: "test_channel_id",
      public_key: "test_api_key",
      user_token: "test_user_token",
      branch_slug: TEST_BRANCH_SLUG,
    });
  });

  test("buildSlackAuthUrl stores nonce in sessionStorage", () => {
    const { result } = renderHook(() =>
      useSlackAuth("test_client_id", "http://localhost:3000"),
    );

    result.current.buildSlackAuthUrl();

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      getSlackNonceStorageKey("test_channel_id"),
      "test-nonce-uuid",
    );
  });

  test("buildSlackAuthUrl generates a new nonce each time", () => {
    mockRandomUUID
      .mockReturnValueOnce("nonce-1")
      .mockReturnValueOnce("nonce-2");

    const { result } = renderHook(() =>
      useSlackAuth("test_client_id", "http://localhost:3000"),
    );

    const url1 = new URL(result.current.buildSlackAuthUrl());
    const state1 = JSON.parse(
      new URLSearchParams(url1.search).get("state") || "{}",
    );

    const url2 = new URL(result.current.buildSlackAuthUrl());
    const state2 = JSON.parse(
      new URLSearchParams(url2.search).get("state") || "{}",
    );

    expect(state1.nonce).toBe("nonce-1");
    expect(state2.nonce).toBe("nonce-2");
  });

  test("buildSlackAuthUrl uses custom scopes when provided", () => {
    const { result } = renderHook(() =>
      useSlackAuth("test_client_id", "http://localhost:3000", {
        scopes: ["custom:scope"],
      }),
    );

    const url = new URL(result.current.buildSlackAuthUrl());
    const params = new URLSearchParams(url.search);

    expect(params.get("scope")).toBe("custom:scope");
  });

  test("buildSlackAuthUrl combines default and additional scopes", () => {
    const { result } = renderHook(() =>
      useSlackAuth("test_client_id", "http://localhost:3000", {
        additionalScopes: ["additional:scope"],
      }),
    );

    const url = new URL(result.current.buildSlackAuthUrl());
    const params = new URLSearchParams(url.search);
    const scopes = params.get("scope")?.split(",");

    expect(scopes).toContain("additional:scope");
    expect(scopes).toContain("chat:write");
  });

  test("disconnectFromSlack handles successful disconnection", async () => {
    mockSlackClient.revokeAccessToken.mockResolvedValueOnce("ok");

    const { result } = renderHook(() => useSlackAuth("test_client_id"));

    await act(async () => {
      await result.current.disconnectFromSlack();
    });

    expect(mockSlackClient.revokeAccessToken).toHaveBeenCalledWith({
      tenant: "test_tenant_id",
      knockChannelId: "test_channel_id",
    });
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnecting");
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnected");
    expect(mockSetActionLabel).toHaveBeenCalledWith(null);
  });

  test("disconnectFromSlack handles error cases", async () => {
    mockSlackClient.revokeAccessToken.mockRejectedValueOnce(
      new Error("Failed"),
    );

    const { result } = renderHook(() => useSlackAuth("test_client_id"));

    await act(async () => {
      await result.current.disconnectFromSlack();
    });

    expect(mockSlackClient.revokeAccessToken).toHaveBeenCalled();
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnecting");
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("error");
    expect(mockSetActionLabel).toHaveBeenCalledWith(null);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });
});
