import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAuthPostMessageListener } from "../../../src/modules/core/hooks/useAuthPostMessageListener";

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
vi.stubGlobal("sessionStorage", mockSessionStorage);

describe("useAuthPostMessageListener", () => {
  const knockHost = "https://api.knock.app";
  let popupWindowRef: { current: Window | null };
  let setConnectionStatus: ReturnType<typeof vi.fn>;
  let onAuthenticationComplete: ReturnType<typeof vi.fn> | undefined;
  let mockPopup: { close: ReturnType<typeof vi.fn>; closed: boolean };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.clear();

    // Create a mock popup window
    mockPopup = {
      close: vi.fn(),
      closed: false,
    };

    popupWindowRef = { current: mockPopup };
    setConnectionStatus = vi.fn();
    onAuthenticationComplete = vi.fn();
  });

  it("should handle authComplete string message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

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

  it("should handle authComplete object message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    const event = new MessageEvent("message", {
      data: { type: "authComplete", nonce: "abc" },
      origin: knockHost,
    });
    window.dispatchEvent(event);

    expect(setConnectionStatus).toHaveBeenCalledWith("connected");
    expect(onAuthenticationComplete).toHaveBeenCalledWith("authComplete");
    expect(mockPopup.close).toHaveBeenCalled();
    expect(popupWindowRef.current).toBeNull();
  });

  it("should handle authFailed string message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    const event = new MessageEvent("message", {
      data: "authFailed",
      origin: knockHost,
    });
    window.dispatchEvent(event);

    expect(setConnectionStatus).toHaveBeenCalledWith("error");
    expect(popupWindowRef.current).toBeNull();
  });

  it("should handle authFailed object message and update status", () => {
    renderHook(() =>
      useAuthPostMessageListener({
        knockHost,
        popupWindowRef,
        setConnectionStatus,
        onAuthenticationComplete,
      }),
    );

    const event = new MessageEvent("message", {
      data: { type: "authFailed" },
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

  describe("CSRF nonce verification", () => {
    const nonceStorageKey = "knock:slack-auth-nonce:channel_123";

    it("should accept authComplete when nonce matches", () => {
      mockSessionStorage.setItem(nonceStorageKey, "valid-nonce");

      renderHook(() =>
        useAuthPostMessageListener({
          knockHost,
          popupWindowRef,
          setConnectionStatus,
          onAuthenticationComplete,
          nonceStorageKey,
        }),
      );

      const event = new MessageEvent("message", {
        data: { type: "authComplete", nonce: "valid-nonce" },
        origin: knockHost,
      });
      window.dispatchEvent(event);

      expect(setConnectionStatus).toHaveBeenCalledWith("connected");
      expect(onAuthenticationComplete).toHaveBeenCalledWith("authComplete");
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        nonceStorageKey,
      );
    });

    it("should reject authComplete when nonce does not match", () => {
      mockSessionStorage.setItem(nonceStorageKey, "expected-nonce");

      renderHook(() =>
        useAuthPostMessageListener({
          knockHost,
          popupWindowRef,
          setConnectionStatus,
          onAuthenticationComplete,
          nonceStorageKey,
        }),
      );

      const event = new MessageEvent("message", {
        data: { type: "authComplete", nonce: "wrong-nonce" },
        origin: knockHost,
      });
      window.dispatchEvent(event);

      expect(setConnectionStatus).toHaveBeenCalledWith("error");
      expect(onAuthenticationComplete).not.toHaveBeenCalled();
    });

    it("should accept authComplete with legacy string format even when nonceStorageKey is set", () => {
      mockSessionStorage.setItem(nonceStorageKey, "stored-nonce");

      renderHook(() =>
        useAuthPostMessageListener({
          knockHost,
          popupWindowRef,
          setConnectionStatus,
          onAuthenticationComplete,
          nonceStorageKey,
        }),
      );

      // Legacy API sends bare string — no nonce to verify, so allow it
      const event = new MessageEvent("message", {
        data: "authComplete",
        origin: knockHost,
      });
      window.dispatchEvent(event);

      expect(setConnectionStatus).toHaveBeenCalledWith("connected");
      expect(onAuthenticationComplete).toHaveBeenCalledWith("authComplete");
    });

    it("should reject authComplete when stored nonce is missing", () => {
      // Do NOT store a nonce — simulates cleared storage or replay
      renderHook(() =>
        useAuthPostMessageListener({
          knockHost,
          popupWindowRef,
          setConnectionStatus,
          onAuthenticationComplete,
          nonceStorageKey,
        }),
      );

      const event = new MessageEvent("message", {
        data: { type: "authComplete", nonce: "some-nonce" },
        origin: knockHost,
      });
      window.dispatchEvent(event);

      expect(setConnectionStatus).toHaveBeenCalledWith("error");
      expect(onAuthenticationComplete).not.toHaveBeenCalled();
    });

    it("should clean up stored nonce on authFailed", () => {
      mockSessionStorage.setItem(nonceStorageKey, "stored-nonce");

      renderHook(() =>
        useAuthPostMessageListener({
          knockHost,
          popupWindowRef,
          setConnectionStatus,
          onAuthenticationComplete,
          nonceStorageKey,
        }),
      );

      const event = new MessageEvent("message", {
        data: { type: "authFailed", nonce: "stored-nonce" },
        origin: knockHost,
      });
      window.dispatchEvent(event);

      expect(setConnectionStatus).toHaveBeenCalledWith("error");
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        nonceStorageKey,
      );
    });
  });
});
