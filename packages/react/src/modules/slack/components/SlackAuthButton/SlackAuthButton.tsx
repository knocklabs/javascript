import {
  useKnockClient,
  useKnockSlackClient,
  useSlackAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useMemo } from "react";
import { useEffect } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

export interface SlackAuthButtonProps {
  slackClientId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
  // When provided, the default scopes will be overridden with the provided scopes
  scopes?: string[];
  // Additional scopes to add to the default scopes
  additionalScopes?: string[];
}

export const SlackAuthButton: FunctionComponent<SlackAuthButtonProps> = ({
  slackClientId,
  redirectUrl,
  onAuthenticationComplete,
  scopes,
  additionalScopes,
}) => {
  const { t } = useTranslations();
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
    tenantId,
    knockSlackChannelId,
    popupWindowRef,
  } = useKnockSlackClient();

  const useSlackAuthOptions = useMemo(
    () => ({
      scopes,
      additionalScopes,
    }),
    [scopes, additionalScopes],
  );

  const { buildSlackAuthUrl, disconnectFromSlack } = useSlackAuth(
    slackClientId,
    redirectUrl,
    useSlackAuthOptions,
  );

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== knock.host) {
        return;
      }

      if (event.data === "authComplete") {
        setConnectionStatus("connected");
        if (onAuthenticationComplete) {
          onAuthenticationComplete(event.data);
        }
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
          const authRes = await knock.slack.authCheck({
            tenant: tenantId,
            knockChannelId: knockSlackChannelId,
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

  const disconnectLabel = t("slackDisconnect") || null;
  const reconnectLabel = t("slackReconnect") || null;

  // Loading states
  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnecting"
  ) {
    return (
      <div className="rsk-connect__button rsk-connect__button--loading">
        <SlackIcon height="16px" width="16px" />
        <span>
          {connectionStatus === "connecting"
            ? t("slackConnecting")
            : t("slackDisconnecting")}
        </span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildSlackAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rsk-connect__button rsk-connect__button--error"
        onMouseEnter={() => setActionLabel(reconnectLabel)}
        onMouseLeave={() => setActionLabel(null)}
      >
        <SlackIcon height="16px" width="16px" />
        <span className="rsk-connect__button__text--error">
          {actionLabel || errorLabel || t("slackError")}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildSlackAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rsk-connect__button rsk-connect__button--disconnected"
      >
        <SlackIcon height="16px" width="16px" />
        <span>{t("slackConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromSlack}
      className="rsk-connect__button rsk-connect__button--connected"
      onMouseEnter={() => setActionLabel(disconnectLabel)}
      onMouseLeave={() => setActionLabel(null)}
    >
      <SlackIcon height="16px" width="16px" />
      <span className="rsk-connect__button__text--connected">
        {actionLabel || t("slackConnected")}
      </span>
    </button>
  );
};
