import type { Feed } from "@knocklabs/client";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useFeedSettings from "../../src/modules/feed/hooks/useFeedSettings";
import {
  authenticateKnock,
  createMockFeed,
  mockNetworkSuccess,
} from "../test-utils/mocks";

describe("useFeedSettings", () => {
  it("fetches and returns feed settings", async () => {
    // Arrange: create a mock feed and stub network response
    const { feed, knock, mockApiClient } = createMockFeed("feed_123");
    authenticateKnock(knock);

    const fakeSettings = {
      features: {
        branding_required: false,
      },
    };

    mockNetworkSuccess(mockApiClient, fakeSettings);

    // Cast to align with the type that useFeedSettings expects (dist vs src artifact mismatch in mocks)
    const { result } = renderHook(() =>
      useFeedSettings(feed as unknown as Feed),
    );

    // Expect initial loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.settings).toBeNull();

    // Wait for hook to finish fetching
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toEqual(fakeSettings);
  });

  it("handles api error by returning null settings", async () => {
    const { feed, knock, mockApiClient } = createMockFeed("feed_123");
    authenticateKnock(knock);

    mockApiClient.makeRequest.mockResolvedValue({
      statusCode: "error",
      error: "failed",
      status: 500,
    });

    // Cast to align with the type that useFeedSettings expects (dist vs src artifact mismatch in mocks)
    const { result } = renderHook(() =>
      useFeedSettings(feed as unknown as Feed),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBeNull();
  });

  it("leaves settings null when a success response is missing the features payload", async () => {
    const { feed, knock, mockApiClient } = createMockFeed("feed_123");
    authenticateKnock(knock);

    // A degraded connection (captive portal / proxy) can return a 200 whose
    // body is not the feed settings object. We must not fabricate a default
    // from it, which would silently suppress branding when it is required.
    mockNetworkSuccess(mockApiClient, {});

    const { result } = renderHook(() =>
      useFeedSettings(feed as unknown as Feed),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.settings).toBeNull();
  });

  it("does not fetch settings when the user is unauthenticated", async () => {
    // No `authenticateKnock` here: the feed's knock has no user.
    const { feed, mockApiClient } = createMockFeed("feed_123");

    const { result } = renderHook(() =>
      useFeedSettings(feed as unknown as Feed),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.settings).toBeNull();
    expect(mockApiClient.makeRequest).not.toHaveBeenCalled();
  });
});
