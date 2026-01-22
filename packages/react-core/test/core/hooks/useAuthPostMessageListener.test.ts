import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthPostMessageListener } from "../../../src/modules/core/hooks/useAuthPostMessageListener";

describe("useAuthPostMessageListener", () => {
  const knockHost = "https://api.knock.app";
  let popupWindowRef: { current: Window | null };
  let setConnectionStatus: ReturnType<typeof vi.fn>;
  let onAuthenticationComplete: ReturnType<typeof vi.fn> | undefined;
  let mockPopup: { close: ReturnType<typeof vi.fn>; closed: boolean };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock popup window
    mockPopup = {
      close: vi.fn(),
      closed: false,
    };

    popupWindowRef = { current: mockPopup };
    setConnectionStatus = vi.fn();
    onAuthenticationComplete = vi.fn();
  });

  it("should handle authComplete message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    // Simulate postMessage event with authComplete
    const event = new MessageEvent("message", {
      data: "authComplete",
      origin: knockHost,
    });
    window.dispatchEvent(event);

    expect(setConnectionStatus).toHaveBeenCalledWith("connected");
    expect(onAuthenticationComplete).toHaveBeenCalledWith("authComplete");
    expect(mockPopup.close).toHaveBeenCalled();
    expect(popupWindowRef.current).toBeNull();
  });

  it("should handle authFailed message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    // Simulate postMessage event with authFailed
    const event = new MessageEvent("message", {
      data: "authFailed",
      origin: knockHost,
    });
    window.dispatchEvent(event);

    expect(setConnectionStatus).toHaveBeenCalledWith("error");
    expect(popupWindowRef.current).toBeNull();
  });

  it("should ignore messages from different origins", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    // Simulate postMessage event from different origin
    const event = new MessageEvent("message", {
      data: "authComplete",
      origin: "https://evil.com",
    });
    window.dispatchEvent(event);

    expect(setConnectionStatus).not.toHaveBeenCalled();
    expect(onAuthenticationComplete).not.toHaveBeenCalled();
    expect(mockPopup.close).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });
});
