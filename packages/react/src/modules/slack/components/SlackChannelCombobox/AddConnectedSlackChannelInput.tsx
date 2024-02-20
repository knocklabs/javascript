import { SlackChannelConnection } from "@knocklabs/client";
import { useState } from "react";

import { SlackIcon } from "../SlackIcon";

import ConnectionErrorInfoBoxes from "./ConnectionErrorInfoBoxes";
import "./styles.css";

import { Spinner } from "../../../core";

const AddConnectedSlackChannelInput = ({
  inErrorState,
  connectedChannels = [],
  updateConnectedChannels,
  connectedChannelsError,
  connectedChannelsUpdating,
}: {
  inErrorState: boolean;
  connectedChannels: SlackChannelConnection[];
  updateConnectedChannels: (channels: SlackChannelConnection[]) => void;
  connectedChannelsError: string | null;
  connectedChannelsUpdating: boolean;
}) => {
  const [value, setValue] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submitChannel = () => {
    if (!value) {
      return;
    }

    if (localError) {
      setLocalError(null);
    }

    const alreadyConnected = connectedChannels.find(
      (channel) => channel.channel_id === value,
    );

    if (alreadyConnected) {
      setValue("");
      return setLocalError(`"${value}" already connected.`);
    }

    const channelsToSendToKnock = [...connectedChannels, { channel_id: value }];
    updateConnectedChannels(channelsToSendToKnock);
    setValue("");
  };

  return (
    <div className="rnf-connect-channel-input-container">
      <input
        className={`rnf-input ${((inErrorState || !!localError) && !value) && "rnf-input-error"}`}
        tabIndex={-1}
        id="slack-channel-search"
        type="text"
        placeholder={localError || connectedChannelsError || "Slack channel ID"}
        onChange={(e) => setValue(e.target.value)}
        value={value || ""}
      />
      <button className="rnf-button" onClick={submitChannel}>
        {connectedChannelsUpdating ? (
          <Spinner size="15px" thickness={3} />
        ) : (
          <SlackIcon height="16px" width="16px" />
        )}
        Connect channel
      </button>
      <ConnectionErrorInfoBoxes />
    </div>
  );
};

export default AddConnectedSlackChannelInput;
