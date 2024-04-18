import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";
import { FunctionComponent } from "react";

import SlackConnectedChannelTag from "./SlackConnectedChannelTag";
import "./styles.css";

export interface SlackConnectedChannelTagListProps {
  connectedChannels: SlackChannelConnection[] | null;
  slackChannels: SlackChannel[];
  updateConnectedChannels: (channelId: string) => void;
}

const SlackConnectedChannelTagList: FunctionComponent<
  SlackConnectedChannelTagListProps
> = ({ connectedChannels, slackChannels, updateConnectedChannels }) => {
  const connectedChannelsMap = new Map(
    connectedChannels?.map((channel) => [channel.channel_id, channel]),
  );

  const channels =
    slackChannels?.filter((slackChannel) => {
      return connectedChannelsMap.has(slackChannel.id || "");
    }) || [];

  return (
    <div className="rsk-combobox__connected_channel_tag_list">
      {channels.map((channel) => (
        <SlackConnectedChannelTag
          key={channel.id}
          channel={channel}
          updateConnectedChannels={updateConnectedChannels}
        />
      ))}
    </div>
  );
};

export default SlackConnectedChannelTagList;
