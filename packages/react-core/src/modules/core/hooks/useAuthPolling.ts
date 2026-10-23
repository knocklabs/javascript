import { useEffect } from "react";

import { AuthCheckResult, ConnectionStatus } from "../types";

export interface UseAuthPollingOptions {
  popupWindowRef: React.MutableRefObject<Window | null>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  authCheckFn: () => Promise<AuthCheckResult>;
  onAuthenticationComplete?: (authenticationResp: string) => void;
}

/**
 * Hook that polls an authentication check endpoint until success or timeout.
 *
 * Polls every 2 seconds for up to 3 minutes (90 iterations). Has three stop conditions:
 * 1. Max timeout reached → sets error status
 * 2. Popup closed + 10s grace period → stops silently
 * 3. Success detected via authCheckFn → updates status and closes popup
 *
 * @param options - Configuration options for the polling mechanism
 *
 * @example
 * ```tsx
 * useAuthPolling({
 *   popupWindowRef,
 *   setConnectionStatus,
 *   onAuthenticationComplete,
 *   authCheckFn: useCallback(async () => {
 *     return knock.slack.authCheck({
 *       tenant: tenantId,
 *       knockChannelId: knockSlackChannelId,
 *     });
 *   }, [knock.slack, tenantId, knockSlackChannelId]),
 * });
 * ```
 */
export function useAuthPolling(options: UseAuthPollingOptions): void {
  const {
    popupWindowRef,
    setConnectionStatus,
    onAuthenticationComplete,
    authCheckFn,
  } = options;

  useEffect(
    () => {
      let pollCount = 0;
      const maxPolls = 90;
      let popupClosedAt: number | null = null;
      let isActive = true;

      const pollInterval = setInterval(async () => {
        if (!isActive) {
          clearInterval(pollInterval);
          return;
        }

        const popupWindow = popupWindowRef.current;
        if (!popupWindow) {
          return;
        }

        pollCount++;

        const isPopupClosed = popupWindow.closed;
        if (isPopupClosed && !popupClosedAt) {
          popupClosedAt = Date.now();
        }

        // Stop condition 1: Max timeout reached
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          setConnectionStatus("error");
          return;
        }

        // Stop condition 2: Popup closed + grace period expired
        if (popupClosedAt && Date.now() - popupClosedAt > 10000) {
          clearInterval(pollInterval);
          popupWindowRef.current = null;
          return;
        }

        try {
          const authRes = await authCheckFn();

          // Stop condition 3: Success detected
          if (authRes.connection?.ok) {
            clearInterval(pollInterval);
            setConnectionStatus("connected");
            if (onAuthenticationComplete) {
              onAuthenticationComplete("authComplete");
            }
            if (popupWindow && !popupWindow.closed) {
              popupWindow.close();
            }
            popupWindowRef.current = null;
          }
        } catch (_error) {
          // Continue polling on error
        }
      }, 2000);

      return () => {
        isActive = false;
        clearInterval(pollInterval);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // Empty deps - run once on mount and keep polling
      // This is intentionally simple/brute force
    ],
  );
}
