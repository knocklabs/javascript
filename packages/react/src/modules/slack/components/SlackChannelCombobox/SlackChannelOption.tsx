import { SlackChannel } from "@knocklabs/client";
import { useMemo, useState } from "react";

import CheckmarkIcon from "./icons/CheckmarkIcon";
import HashtagIcon from "./icons/HashtagIcon";
import LockIcon from "./icons/LockIcon";
import "./styles.css";

type Props = {
  channel: SlackChannel;
  isLoading: boolean;
  isConnected: boolean;
  onClick: (id: string) => void;
  tabIndex: number;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
};

const SlackChannelOption = ({
  channel,
  isLoading,
  isConnected,
  onClick,
  tabIndex,
  channelOptionProps,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const showCheckmark = useMemo(
    () => isHovered || isConnected,
    [isConnected, isHovered],
  );

  return (
    <button
      key={channel.id}
      className="rnf-channel-option"
      onClick={() => !isLoading && onClick(channel.id)}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={tabIndex}
      {...channelOptionProps}
    >
      {showCheckmark ? (
        <span className="rnf-icon">
          <CheckmarkIcon isConnected={isConnected} />
        </span>
      ) : (
        <span style={{ width: "18px" }} />
      )}
      <span className="rnf-icon">
        {channel.is_private ? <LockIcon /> : <HashtagIcon />}
      </span>
      {channel.name}
    </button>
  );
};

export default SlackChannelOption;
