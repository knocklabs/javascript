import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";
import { AriaListBoxOptions } from "@react-aria/listbox";

import SlackChannelOption from "./SlackChannelOption";
import "./styles.css";

type Props = AriaListBoxOptions<unknown> & {
  slackChannels: SlackChannel[];
  isLoading: boolean;
  connectedChannels: SlackChannelConnection[] | null;
  onClick: (channelId: string) => void;
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
};

const SlackChannelListBox = ({
  slackChannels,
  isLoading,
  connectedChannels,
  onClick,
  listBoxProps,
  channelOptionProps
}: Props) => {
  return (
    <div className="rnf-list-box" {...listBoxProps}>
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

          />
        );
      })}
    </div>
  );
};

export default SlackChannelListBox;
