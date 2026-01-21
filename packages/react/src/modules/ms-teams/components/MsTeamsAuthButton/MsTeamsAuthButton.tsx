import {
  useKnockClient,
  useKnockMsTeamsClient,
  useMsTeamsAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useEffect } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { MsTeamsIcon } from "../MsTeamsIcon";

import "./styles.css";

export type MsTeamsAuthButtonProps = {
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
} & (
  | {
      /**
       * The client ID of your Microsoft Graph API-enabled application registered with Microsoft Entra. This should
       * match the "Graph API client ID" setting of your Microsoft Teams channel in the Knock dashboard.
       */
      graphApiClientId: string;
    }
  | {
      /**
       * @deprecated Use `graphApiClientId` instead. This field will be removed in a future release.
       */
      msTeamsBotId: string;
    }
);

export const MsTeamsAuthButton: FunctionComponent<MsTeamsAuthButtonProps> = ({
  redirectUrl,
  onAuthenticationComplete,
  ...props
}) => {
  const graphApiClientId =
    "graphApiClientId" in props ? props.graphApiClientId : props.msTeamsBotId;

  const { t } = useTranslations();
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
    tenantId,
    knockMsTeamsChannelId,
    popupWindowRef,
  } = useKnockMsTeamsClient();

  const { buildMsTeamsAuthUrl, disconnectFromMsTeams } = useMsTeamsAuth(
    graphApiClientId,
    redirectUrl,
  );

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== knock.host) {
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
        popupWindowRef.current = null;
      }
    };

    window.addEventListener("message", receiveMessage, false);
    return () => window.removeEventListener("message", receiveMessage);
  }, [
    knock.host,
    onAuthenticationComplete,
    setConnectionStatus,
    popupWindowRef,
  ]);

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

        // Check if popup is closed
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
          const authRes = await knock.msTeams.authCheck({
            tenant: tenantId,
            knockChannelId: knockMsTeamsChannelId,
          });

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

  const disconnectLabel = t("msTeamsDisconnect") || null;
  const reconnectLabel = t("msTeamsReconnect") || null;

  // Loading states
  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnecting"
  ) {
    return (
      <div className="rtk-connect__button rtk-connect__button--loading">
        <MsTeamsIcon height="16px" width="16px" />
        <span>
          {connectionStatus === "connecting"
            ? t("msTeamsConnecting")
            : t("msTeamsDisconnecting")}
        </span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildMsTeamsAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rtk-connect__button rtk-connect__button--error"
        onMouseEnter={() => setActionLabel(reconnectLabel)}
        onMouseLeave={() => setActionLabel(null)}
      >
        <MsTeamsIcon height="16px" width="16px" />
        <span className="rtk-connect__button__text--error">
          {actionLabel || errorLabel || t("msTeamsError")}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildMsTeamsAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rtk-connect__button rtk-connect__button--disconnected"
      >
        <MsTeamsIcon height="16px" width="16px" />
        <span>{t("msTeamsConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromMsTeams}
      className="rtk-connect__button rtk-connect__button--connected"
      onMouseEnter={() => setActionLabel(disconnectLabel)}
      onMouseLeave={() => setActionLabel(null)}
    >
      <MsTeamsIcon height="16px" width="16px" />
      <span className="rtk-connect__button__text--connected">
        {actionLabel || t("msTeamsConnected")}
      </span>
    </button>
  );
};
