import {
  useKnockClient,
  useKnockSlackClient,
  useSlackAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent } from "react";
import { useEffect } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

export interface SlackAuthButtonProps {
  slackClientId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
  additionalScopes?: string[];
}

export const SlackAuthButton: FunctionComponent<SlackAuthButtonProps> = ({
  slackClientId,
  redirectUrl,
  onAuthenticationComplete,
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
  } = useKnockSlackClient();

  const { buildSlackAuthUrl, disconnectFromSlack } = useSlackAuth(
    slackClientId,
    redirectUrl,
    additionalScopes,
  );

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== knock.host) {
        return;
      }

      try {
        if (event.data === "authComplete") {
          setConnectionStatus("connected");
        }

        if (event.data === "authFailed") {
          setConnectionStatus("error");
        }

        if (onAuthenticationComplete) {
          onAuthenticationComplete(event.data);
        }
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    window.addEventListener("message", receiveMessage, false);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [knock.host, onAuthenticationComplete, setConnectionStatus]);

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
        onClick={() => openPopupWindow(buildSlackAuthUrl())}
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
        onClick={() => openPopupWindow(buildSlackAuthUrl())}
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
