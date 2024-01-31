import { SlackIcon } from "../SlackIcon";
import "./styles.css";

import { useManageSlackConnection } from "../../hooks/useManageSlackConnection";

type Props = {
  tenant: string;
  knockSlackChannelId: string;
  slackClientId: string;
  redirectUrl?: string;
};

export const ConnectToSlackButton: React.FC<Props> = ({
  tenant,
  knockSlackChannelId,
  slackClientId,
  redirectUrl,
}) => {
  const { connectionStatus, actionLabel, errorLabel, setActionLabel, buildSlackAuthUrl, disconnectFromSlack } =
    useManageSlackConnection(
      knockSlackChannelId,
      tenant,
      slackClientId,
      redirectUrl,
    );

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
      <a
        href={buildSlackAuthUrl()}
        className="rnf-slackConnect-button rnf-slackConnect-button--error"
        onMouseEnter={() => setActionLabel("Reconnect")}
        onMouseLeave={() => setActionLabel("")}
      >
        <SlackIcon height="16px" width="16px" />
        <span className="rnf-slackConnect-text--error">
          {actionLabel || errorLabel || "Error"}
        </span>
      </a>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <a
        href={buildSlackAuthUrl()}
        className="rnf-slackConnect-button rnf-slackConnect-button--disconnected"
      >
        <SlackIcon height="16px" width="16px" />
        <span>Connect to Slack</span>
      </a>
    );
  }

  // Connected state
  return (
    <a
      onClick={disconnectFromSlack}
      className="rnf-slackConnect-button rnf-slackConnect-button--connected"
      onMouseEnter={() => setActionLabel("Disconnect")}
      onMouseLeave={() => setActionLabel("")}
    >
      <SlackIcon height="16px" width="16px" />
      <span className="rnf-slackConnect-text--connected">
        {actionLabel || "Connected"}
      </span>
    </a>
  );
};
