import { act, renderHook } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { mockMsTeamsContext, mockTranslations } from "../test-utils/mocks";

// -----------------------------------------------------------------------------
// Stubs & Mocks
// -----------------------------------------------------------------------------

const mockSetConnectionStatus = vi.fn();
const mockSetActionLabel = vi.fn();

mockMsTeamsContext({
  knockMsTeamsChannelId: "test_channel_id",
  tenantId: "test_tenant_id",
  setConnectionStatus: mockSetConnectionStatus,
  setActionLabel: mockSetActionLabel,
});
mockTranslations();

const mockMsTeamsClient = {
  revokeAccessToken: vi.fn(),
};

vi.mock("../../src/modules/core", () => ({
  useKnockClient: () => ({
    msTeams: mockMsTeamsClient,
    apiKey: "test_api_key",
    userToken: "test_user_token",
    host: "https://example.com",
  }),
}));

// Dynamically load the hook after mocks are in place
let useMsTeamsAuth: typeof import("../../src/modules/ms-teams/hooks/useMsTeamsAuth").default;

beforeAll(async () => {
  ({ default: useMsTeamsAuth } = await import(
    "../../src/modules/ms-teams/hooks/useMsTeamsAuth?m" as string
  ));
});

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe("useMsTeamsAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("buildMsTeamsAuthUrl returns the correct URL", () => {
    const { result } = renderHook(() =>
      useMsTeamsAuth("bot_client_id", "https://myapp.com/callback"),
    );

    const url = new URL(result.current.buildMsTeamsAuthUrl());
    const params = new URLSearchParams(url.search);
    const state = JSON.parse(params.get("state") || "{}");

    expect(url.origin + url.pathname).toBe(
      "https://login.microsoftonline.com/organizations/adminconsent",
    );
    expect(params.get("client_id")).toBe("bot_client_id");
    expect(params.get("redirect_uri")).toBe(
      "https://example.com/providers/ms-teams/authenticate",
    );
    expect(state).toEqual({
      redirect_url: "https://myapp.com/callback",
      ms_teams_tenant_object: {
        object_id: "test_tenant_id",
        collection: "$tenants",
      },
      channel_id: "test_channel_id",
      public_key: "test_api_key",
      user_token: "test_user_token",
    });
  });

  test("disconnectFromMsTeams handles successful revoke", async () => {
    mockMsTeamsClient.revokeAccessToken.mockResolvedValueOnce("ok");

    const { result } = renderHook(() => useMsTeamsAuth("bot_client_id"));

    await act(async () => {
      await result.current.disconnectFromMsTeams();
    });

    expect(mockSetActionLabel).toHaveBeenCalledWith(null);
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnecting");
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnected");
  });

  test("disconnectFromMsTeams handles errors", async () => {
    mockMsTeamsClient.revokeAccessToken.mockRejectedValueOnce(
      new Error("fail"),
    );

    const { result } = renderHook(() => useMsTeamsAuth("bot_client_id"));

    await act(async () => {
      await result.current.disconnectFromMsTeams();
    });

    expect(mockSetConnectionStatus).toHaveBeenCalledWith("disconnecting");
    expect(mockSetConnectionStatus).toHaveBeenCalledWith("error");
  });
});
