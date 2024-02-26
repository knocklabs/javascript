import { SlackChannelConnection } from "@knocklabs/client";
import { useTranslations } from "@knocklabs/react-core";
import { useState } from "react";

import { Spinner } from "../../../core";
import "../../theme.css";
import ConnectionErrorInfoBoxes from "../SlackChannelCombobox/SlackConnectionError";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

const SlackAddChannelInput = ({
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
  const { t } = useTranslations();
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
      return setLocalError(t("slackChannelAlreadyConnected") || "");
    }

    const channelsToSendToKnock = [...connectedChannels, { channel_id: value }];
    updateConnectedChannels(channelsToSendToKnock);
    setValue("");
  };

  return (
    <div className="rsk-connect-channel">
      <input
        className={`rsk-connect-channel__input ${(inErrorState || !!localError) && !value && "rsk-connect-channel__input--error"}`}
        tabIndex={-1}
        id="slack-channel-search"
        type="text"
        placeholder={
          localError || connectedChannelsError || t("slackChannelID")
        }
        onChange={(e) => setValue(e.target.value)}
        value={value || ""}
      />
      <button className="rsk-connect-channel__button" onClick={submitChannel}>
        {connectedChannelsUpdating ? (
          <Spinner size="15px" thickness={3} />
        ) : (
          <SlackIcon height="16px" width="16px" />
        )}
        {t("slackConnectChannel")}
      </button>
      <ConnectionErrorInfoBoxes />
    </div>
  );
};

export default SlackAddChannelInput;
