import {
  useKnockClient,
  useKnockSlackClient,
  useSlackAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useId, useMemo } from "react";
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

  const requestId = useId();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
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
    const handleAuthMessage = (data: string) => {
      try {
        if (data === "authComplete") {
          setConnectionStatus("connected");
        }

        if (data === "authFailed") {
          setConnectionStatus("error");
        }

        if (onAuthenticationComplete) {
          onAuthenticationComplete(data);
        }
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    // Listen for both window.postMessage and BroadcastChannel
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== knock.host) {
        return;
      }
      handleAuthMessage(event.data);
    };

    window.addEventListener("message", receiveMessage, false);

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel(`knock:oauth:${requestId}`);
      broadcastChannel.onmessage = (event) => {
        if (event.data.origin === knock.host) {
          handleAuthMessage(event.data.type || event.data);
        }
      };
    }

    // Cleanup listeners when component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
      broadcastChannel?.close();
    };
  }, [knock.host, requestId, onAuthenticationComplete, setConnectionStatus]);

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
        onClick={() => openPopupWindow(buildSlackAuthUrl(requestId))}
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
        onClick={() => openPopupWindow(buildSlackAuthUrl(requestId))}
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
