import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthPolling } from "../../../src/modules/core/hooks/useAuthPolling";
import type {
  AuthCheckResult,
  ConnectionStatus,
} from "../../../src/modules/core/types";

describe("useAuthPolling", () => {
  let popupWindowRef: { current: Window | null };
  let setConnectionStatus: ReturnType<typeof vi.fn<[ConnectionStatus], void>>;
  let onAuthenticationComplete:
    | ReturnType<typeof vi.fn<[string], void>>
    | undefined;
  let authCheckFn: ReturnType<typeof vi.fn<[], Promise<AuthCheckResult>>>;
  let mockPopup: Window;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Create a mock popup window
    mockPopup = {
      close: vi.fn(),
      closed: false,
    } as unknown as Window;

    popupWindowRef = { current: mockPopup };
    setConnectionStatus = vi.fn();
    onAuthenticationComplete = vi.fn();
    authCheckFn = vi.fn(() => Promise.resolve({ connection: { ok: false } }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should poll authCheckFn every 2 seconds", async () => {
    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    // Fast-forward 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(1);

    // Fast-forward another 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(2);

    // Fast-forward another 2 seconds
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(3);
  });

  it("should stop polling and set connected status on success", async () => {
    authCheckFn = vi.fn(() => Promise.resolve({ connection: { ok: true } }));

    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    await vi.advanceTimersByTimeAsync(2000);

    expect(setConnectionStatus).toHaveBeenCalledWith("connected");
    expect(onAuthenticationComplete).toHaveBeenCalledWith("authComplete");
    expect(mockPopup.close).toHaveBeenCalled();
    expect(popupWindowRef.current).toBeNull();

    // Should not poll again after success
    const callCount = authCheckFn.mock.calls.length;
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(callCount);
  });

  it("should set error status after max polls (90 iterations)", async () => {
    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    // Fast-forward 90 iterations (180 seconds)
    await vi.advanceTimersByTimeAsync(90 * 2000);

    expect(setConnectionStatus).toHaveBeenCalledWith("error");
  });

  it("should stop polling after popup closed + 10s grace period", async () => {
    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    // Poll once
    await vi.advanceTimersByTimeAsync(2000);
    const initialCallCount = authCheckFn.mock.calls.length;

    // Close the popup (starts grace period timer)
    mockPopup.closed = true;

    // Advance past the grace period (10+ seconds)
    await vi.advanceTimersByTimeAsync(12000);

    // Should not call setConnectionStatus with error (stops silently)
    expect(setConnectionStatus).not.toHaveBeenCalledWith("error");
    expect(setConnectionStatus).not.toHaveBeenCalledWith("connected");

    // Should still have polled during grace period
    expect(authCheckFn.mock.calls.length).toBeGreaterThan(initialCallCount);

    // Should not poll again after grace period + some buffer
    const callCountAfterGracePeriod = authCheckFn.mock.calls.length;
    await vi.advanceTimersByTimeAsync(4000);
    expect(authCheckFn).toHaveBeenCalledTimes(callCountAfterGracePeriod);
  });

  it("should not poll if popupWindowRef is null", async () => {
    popupWindowRef.current = null;

    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    await vi.advanceTimersByTimeAsync(10000);

    expect(authCheckFn).not.toHaveBeenCalled();
  });

  it("should continue polling on authCheckFn error", async () => {
    authCheckFn = vi.fn(() => Promise.reject(new Error("Network error")));

    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    // First poll (will error)
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(1);

    // Should continue polling despite error
    await vi.advanceTimersByTimeAsync(2000);
    expect(authCheckFn).toHaveBeenCalledTimes(2);

    // Should not set error status on individual poll errors
    expect(setConnectionStatus).not.toHaveBeenCalledWith("error");
  });

  it("should not close popup if already closed on success", async () => {
    authCheckFn = vi.fn(() => Promise.resolve({ connection: { ok: true } }));
    mockPopup.closed = true;

    renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    await vi.advanceTimersByTimeAsync(2000);

    expect(setConnectionStatus).toHaveBeenCalledWith("connected");
    expect(mockPopup.close).not.toHaveBeenCalled();
    expect(popupWindowRef.current).toBeNull();
  });

  it("should clean up interval on unmount", async () => {
    const { unmount } = renderHook(() =>
      useAuthPolling({
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
        authCheckFn,
      }),
    );

    await vi.advanceTimersByTimeAsync(2000);
    const callCountBeforeUnmount = authCheckFn.mock.calls.length;

    unmount();

    // Should not poll after unmount
    await vi.advanceTimersByTimeAsync(4000);
    expect(authCheckFn).toHaveBeenCalledTimes(callCountBeforeUnmount);
  });
});
