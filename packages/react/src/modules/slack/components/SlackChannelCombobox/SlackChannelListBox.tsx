import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";
import { FunctionComponent } from "react";

import "../../theme.css";

import SlackChannelOption from "./SlackChannelOption";
import "./styles.css";

export interface SlackChannelListBoxProps {
  slackChannels: SlackChannel[];
  isLoading: boolean;
  connectedChannels: SlackChannelConnection[] | null;
  onClick: (channelId: string) => void;
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
  isUpdating: boolean;
}

const SlackChannelListBox: FunctionComponent<SlackChannelListBoxProps> = ({
  slackChannels,
  isLoading,
  connectedChannels,
  onClick,
  listBoxProps,
  channelOptionProps,
  isUpdating,
}) => {
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
