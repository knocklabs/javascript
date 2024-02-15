import { useKnockSlackClient } from "@knocklabs/react-core";

import InfoIcon from "./icons/InfoIcon";

const ConnectionErrorInfoBoxes = () => {
  const { connectionStatus } = useKnockSlackClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rnf-disconnected-info-container">
        <span>
          <InfoIcon />
        </span>

        <div className="rnf-info-container-text">
          {connectionStatus === "disconnected"
            ? "There was an error connecting to Slack. Try reconnecting to find and select channels from your workspace."
            : "Try reconnecting to Slack to find and select channels from your workspace."}
        </div>
      </div>
    );
  }

  return <div />;
};

export default ConnectionErrorInfoBoxes;
