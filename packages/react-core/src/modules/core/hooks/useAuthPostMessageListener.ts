import { useEffect } from "react";

import { ConnectionStatus } from "../types";

export interface UseAuthPostMessageListenerOptions {
  knockHost: string;
  popupWindowRef: React.MutableRefObject<Window | null>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  onAuthenticationComplete?: (authenticationResp: string) => void;
}

/**
 * Hook that listens for postMessage events from OAuth popup windows.
 *
 * Handles "authComplete" and "authFailed" messages sent from the OAuth flow popup,
 * validates the message origin, updates connection status, and closes the popup.
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
  } = options;

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      // Validate message origin for security
      if (event.origin !== knockHost) {
        return;
      }

      if (event.data === "authComplete") {
        setConnectionStatus("connected");
        onAuthenticationComplete?.(event.data);
        // Clear popup ref so polling stops and doesn't trigger callback again
        if (popupWindowRef.current && !popupWindowRef.current.closed) {
          popupWindowRef.current.close();
        }
        popupWindowRef.current = null;
      } else if (event.data === "authFailed") {
        setConnectionStatus("error");
        onAuthenticationComplete?.(event.data);
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
  ]);
}
