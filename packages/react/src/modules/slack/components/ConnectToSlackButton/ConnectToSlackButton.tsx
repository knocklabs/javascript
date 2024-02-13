import {
  useKnockClient,
  useKnockSlackClient,
  useManageSlackConnection,
} from "@knocklabs/react-core";
import { useEffect } from "react";

import { SlackIcon } from "../SlackIcon";

import "./styles.css";

type Props = {
  slackClientId: string;
  redirectUrl?: string;
};

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

export const ConnectToSlackButton: React.FC<Props> = ({
  slackClientId,
  redirectUrl,
}) => {
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
  } = useKnockSlackClient();

  const { buildSlackAuthUrl, disconnectFromSlack } = useManageSlackConnection(
    slackClientId,
    redirectUrl,
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
      } catch (error) {
        setConnectionStatus("error");
      }
    };

    window.addEventListener("message", receiveMessage, false);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [knock.host, setConnectionStatus]);

  // Loading states
  if (connectionStatus === "loading" || connectionStatus === "disconnecting") {
    return (
      <div className="rnf-slackConnect-button rnf-slackConnect-button--loading">
        <SlackIcon height="16px" width="16px" />
        <span>
          {connectionStatus === "loading"
            ? "Connecting to Slack..."
            : "Disconnecting..."}
        </span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => openSlackOauthPopup(buildSlackAuthUrl())}
        className="rnf-slackConnect-button rnf-slackConnect-button--error"
        onMouseEnter={() => setActionLabel("Reconnect")}
        onMouseLeave={() => setActionLabel("")}
      >
        <SlackIcon height="16px" width="16px" />
        <span className="rnf-slackConnect-text--error">
          {actionLabel || errorLabel || "Error"}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => openSlackOauthPopup(buildSlackAuthUrl())}
        className="rnf-slackConnect-button rnf-slackConnect-button--disconnected"
      >
        <SlackIcon height="16px" width="16px" />
        <span>Connect to Slack</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromSlack}
      className="rnf-slackConnect-button rnf-slackConnect-button--connected"
      onMouseEnter={() => setActionLabel("Disconnect")}
      onMouseLeave={() => setActionLabel("")}
    >
      <SlackIcon height="16px" width="16px" />
      <span className="rnf-slackConnect-text--connected">
        {actionLabel || "Connected"}
      </span>
    </button>
  );
};
