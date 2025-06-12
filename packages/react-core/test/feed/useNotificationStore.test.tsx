import Knock, { Feed, type FeedMetadata } from "@knocklabs/client";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useNotificationStore, {
  type Selector,
  useCreateNotificationStore,
} from "../../src/modules/feed/hooks/useNotificationStore";

describe("useCreateNotificationStore", () => {
  const knock = new Knock("test");
  const feedClient = new Feed(knock, "test", {}, undefined);

  it("returns a hook you can use to access the store with a selector", () => {
    const useFeedStore = useCreateNotificationStore(feedClient);
    const { result } = renderHook(() =>
      useFeedStore((state) => ({
        metadata: state.metadata,
      })),
    );

    expect(result.current).toEqual({
      metadata: {
        total_count: 0,
        unread_count: 0,
        unseen_count: 0,
      },
    });
  });

  it("returns a hook you can use to access the store without a selector", () => {
    const useFeedStore = useCreateNotificationStore(feedClient);
    const { result } = renderHook(() => useFeedStore());

    expect(result.current).toEqual(
      expect.objectContaining({
        items: [],
        metadata: expect.objectContaining({
          total_count: 0,
          unread_count: 0,
          unseen_count: 0,
        }),
      }),
    );
    expect(Object.keys(result.current).length).toBeGreaterThan(2);
  });

  it("returns a bound store that can be used with a selector", () => {
    const { result } = renderHook(() => {
      const useStore = useCreateNotificationStore(feedClient);
      return useStore((state) => state.metadata);
    });

    expect(result.current).toEqual({
      total_count: 0,
      unread_count: 0,
      unseen_count: 0,
    });
  });

  it("returns a function", () => {
    const useFeedStore = useCreateNotificationStore(feedClient);
    expect(typeof useFeedStore).toBe("function");
  });
});

describe("useNotificationStore", () => {
  const knock = new Knock("test");

  const feedClient = new Feed(knock, "test", {}, undefined);

  it("returns the full store state when no selector is provided", () => {
    const { result } = renderHook(() => useNotificationStore(feedClient));

    expect(result.current).toEqual(
      expect.objectContaining({
        items: [],
        metadata: expect.objectContaining({
          total_count: 0,
          unread_count: 0,
          unseen_count: 0,
        }),
      }),
    );
    expect(Object.keys(result.current).length).toBeGreaterThan(2);
  });

  it("returns selected state when selector is provided", () => {
    const selector: Selector<FeedMetadata> = (state) => state.metadata;
    const { result } = renderHook(() =>
      useNotificationStore(feedClient, selector),
    );

    expect(result.current).toEqual({
      total_count: 0,
      unread_count: 0,
      unseen_count: 0,
    });
  });

  it("returns the same store reference on multiple calls", () => {
    const { result: result1 } = renderHook(() =>
      useNotificationStore(feedClient),
    );
    const { result: result2 } = renderHook(() =>
      useNotificationStore(feedClient),
    );

    expect(result1.current).toEqual(result2.current);
  });

  it("returns an object without a selector", () => {
    const { result } = renderHook(() => useNotificationStore(feedClient));
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });

  it("returns an object with a selector", () => {
    const selector: Selector<FeedMetadata> = (state) => state.metadata;
    const { result } = renderHook(() =>
      useNotificationStore(feedClient, selector),
    );
    expect(typeof result.current).toBe("object");
    expect(result.current).not.toBeNull();
  });
});
