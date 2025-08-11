import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import useSlackAuth from "../../src/modules/slack/hooks/useSlackAuth";

const TEST_BRANCH_SLUG = "lorem-ipsum-branch";

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
