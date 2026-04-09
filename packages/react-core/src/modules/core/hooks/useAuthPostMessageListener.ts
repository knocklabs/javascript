import { useEffect } from "react";

import { ConnectionStatus } from "../types";

export interface UseAuthPostMessageListenerOptions {
  knockHost: string;
  popupWindowRef: React.MutableRefObject<Window | null>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  onAuthenticationComplete?: (authenticationResp: string) => void;
  /**
   * The sessionStorage key where the CSRF nonce was stored when the auth URL
   * was built. When provided, the listener will verify the nonce returned in
   * the postMessage payload matches the stored value.
   */
  nonceStorageKey?: string;
}

/**
 * Extracts the message type from a postMessage event data payload.
 * Supports both the legacy string format ("authComplete") and the new
 * structured format ({ type: "authComplete", nonce: "..." }).
 */
function getMessageType(data: unknown): string | undefined {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null && "type" in data) {
    return (data as { type: string }).type;
  }
  return undefined;
}

/**
 * Extracts the nonce from a structured postMessage event data payload.
 * Returns undefined for legacy string-format messages.
 */
function getMessageNonce(data: unknown): string | undefined {
  if (typeof data === "object" && data !== null && "nonce" in data) {
    const nonce = (data as { nonce: unknown }).nonce;
    return typeof nonce === "string" ? nonce : undefined;
  }
  return undefined;
}

/**
 * Hook that listens for postMessage events from OAuth popup windows.
 *
 * Handles "authComplete" and "authFailed" messages sent from the OAuth flow popup,
 * validates the message origin, optionally verifies the CSRF nonce, updates
 * connection status, and closes the popup.
 *
 * @param options - Configuration options for the postMessage listener
 *
 * @example
 * ```tsx
 * useAuthPostMessageListener({
 *   knockHost: knock.host,
 *   popupWindowRef,
 *   setConnectionStatus,
 *   onAuthenticationComplete,
 *   nonceStorageKey: "knock:slack-auth-nonce:channel_123",
 * });
 * ```
 */
export function useAuthPostMessageListener(
  options: UseAuthPostMessageListenerOptions,
): void {
  const {
    knockHost,
    popupWindowRef,
    setConnectionStatus,
    onAuthenticationComplete,
    nonceStorageKey,
  } = options;

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      // Validate message origin for security
      if (event.origin !== knockHost) {
        return;
      }

      const messageType = getMessageType(event.data);
      const returnedNonce = getMessageNonce(event.data);

      if (messageType === "authComplete") {
        // Verify CSRF nonce when both a stored nonce and a returned nonce exist
        if (nonceStorageKey && returnedNonce !== undefined) {
          const storedNonce = sessionStorage.getItem(nonceStorageKey);
          if (storedNonce && storedNonce !== returnedNonce) {
            setConnectionStatus("error");
            popupWindowRef.current = null;
            return;
          }
          sessionStorage.removeItem(nonceStorageKey);
        }

        setConnectionStatus("connected");
        onAuthenticationComplete?.(messageType);
        // Clear popup ref so polling stops and doesn't trigger callback again
        if (popupWindowRef.current && !popupWindowRef.current.closed) {
          popupWindowRef.current.close();
        }
        popupWindowRef.current = null;
      } else if (messageType === "authFailed") {
        // Clean up stored nonce on failure
        if (nonceStorageKey) {
          sessionStorage.removeItem(nonceStorageKey);
        }
        setConnectionStatus("error");
        onAuthenticationComplete?.(messageType);
        popupWindowRef.current = null;
      }
    };

    window.addEventListener("message", receiveMessage, false);
    return () => window.removeEventListener("message", receiveMessage);
  }, [
    knockHost,
    onAuthenticationComplete,
    setConnectionStatus,
    popupWindowRef,
    nonceStorageKey,
  ]);
}
