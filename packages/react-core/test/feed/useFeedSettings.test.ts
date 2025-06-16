import type { Feed } from "@knocklabs/client";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useFeedSettings from "../../src/modules/feed/hooks/useFeedSettings";
import { createMockFeed, mockNetworkSuccess } from "../test-utils/mocks";

describe("useFeedSettings", () => {
  it("fetches and returns feed settings", async () => {
    // Arrange: create a mock feed and stub network response
    const { feed, mockApiClient } = createMockFeed("feed_123");

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
    const { feed, mockApiClient } = createMockFeed("feed_123");

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
});
