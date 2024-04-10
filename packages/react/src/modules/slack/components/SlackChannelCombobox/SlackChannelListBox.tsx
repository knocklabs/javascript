import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";

import "../../theme.css";

import SlackChannelOption from "./SlackChannelOption";
import "./styles.css";

type Props = {
  slackChannels: SlackChannel[];
  isLoading: boolean;
  connectedChannels: SlackChannelConnection[] | null;
  onClick: (channelId: string) => void;
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
  isUpdating: boolean;
};

const SlackChannelListBox = ({
  slackChannels,
  isLoading,
  connectedChannels,
  onClick,
  listBoxProps,
  channelOptionProps,
  isUpdating,
}: Props) => {
  return (
    <div className="rsk-combobox__list-box" {...listBoxProps}>
      {slackChannels.map((channel) => {
        return (
          <SlackChannelOption
            key={channel.id}
            tabIndex={0}
            channel={channel}
            isLoading={isLoading}
            isConnected={
              !!connectedChannels?.find(
                (connectedChannel) =>
                  connectedChannel.channel_id === channel.id,
              )
            }
            onClick={onClick}
            channelOptionProps={channelOptionProps}
            isUpdating={isUpdating}
          />
        );
      })}
    </div>
  );
};

export default SlackChannelListBox;
