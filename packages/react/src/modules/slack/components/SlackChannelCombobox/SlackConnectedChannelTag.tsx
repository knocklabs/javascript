import { SlackChannel } from "@knocklabs/client";
import { FunctionComponent } from "react";

import CloseIcon from "./icons/CloseIcon";
import HashtagIcon from "./icons/HashtagIcon";
import LockIcon from "./icons/LockIcon";
import "./styles.css";

export interface SlackConnectedChannelTagProps {
  channel: SlackChannel;
  updateConnectedChannels: (channelId: string) => void;
}

const SlackConnectedChannelTag: FunctionComponent<
  SlackConnectedChannelTagProps
> = ({ channel, updateConnectedChannels }) => {
  return (
    <div className="rsk-combobox__connected_channel_tag">
      <div className="rsk-combobox__connected_channel_tag__channel_type_icon">
        {channel.is_private ? <LockIcon /> : <HashtagIcon />}
      </div>
      <div className="rsk-combobox__connected_channel_tag__text">
        {channel.name}
      </div>
      <button
        onClick={() => updateConnectedChannels(channel.id)}
        className="rsk-combobox__connected_channel_tag__delete_button"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default SlackConnectedChannelTag;
