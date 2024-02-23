import { useKnockSlackClient } from "@knocklabs/react-core";

import InfoIcon from "./icons/InfoIcon";

const SlackConnectionError = () => {
  const { connectionStatus } = useKnockSlackClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rsk-combobox__error">
        <span>
          <InfoIcon />
        </span>

        <div className="rsk-combobox__error__text">
          {connectionStatus === "disconnected"
            ? "There was an error connecting to Slack. Try reconnecting to find and select channels from your workspace."
            : "Try reconnecting to Slack to find and select channels from your workspace."}
        </div>
      </div>
    );
  }

  return <div />;
};

export default SlackConnectionError;
