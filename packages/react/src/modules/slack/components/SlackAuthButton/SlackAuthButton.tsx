import {
  useKnockClient,
  useKnockSlackClient,
  useSlackAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent } from "react";
import { useEffect } from "react";

import "../../theme.css";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

export interface SlackAuthButtonProps {
  slackClientId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
  additionalScopes?: string[];
}

const openSlackOauthPopup = (url: string) => {
  const width = 600;
  const height = 800;
  // Calculate the position to center the window
  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;

  const innerWidth =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const innerHeight =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;

  const left = innerWidth / 2 - width / 2 + screenLeft;
  const top = innerHeight / 2 - height / 2 + screenTop;

  // Window features
  const features = `width=${width},height=${height},top=${top},left=${left}`;

  window.open(url, "Slack OAuth", features);
};

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
        onClick={() => openSlackOauthPopup(buildSlackAuthUrl())}
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
        onClick={() => openSlackOauthPopup(buildSlackAuthUrl())}
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
