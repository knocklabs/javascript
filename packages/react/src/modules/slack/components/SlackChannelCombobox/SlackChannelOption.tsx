import { SlackChannel } from "@knocklabs/client";

import { useEffect, useState } from "react";

import { Spinner } from "../../../core";


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

  isUpdating: boolean;

};

const SlackChannelOption = ({
  channel,
  isLoading,
  isConnected,
  onClick,
  tabIndex,
  channelOptionProps,
  isUpdating,
}: Props) => {
  const [isHovered, setIsHovered] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const icon = () => {
    if (submittedId === channel.id && isUpdating) {
      return <Spinner size="15px" thickness={3} />;
    }

    if (isHovered || isConnected) {
      return <CheckmarkIcon isConnected={isConnected} />;
    }

    return <div style={{ width: "15px", height: "18.5px" }} />;
  };

  const handleOptionClick = (channelId: string) => {
    setSubmittedId(channelId);
    onClick(channelId);
  };

  useEffect(() => {
    if (submittedId && !isUpdating) {
      return setSubmittedId(null);
    }
  }, [isUpdating, submittedId]);

  return (
    <button
      key={channel.id}
      className="rnf-channel-option"
      onClick={() => !isLoading && handleOptionClick(channel.id)}
      disabled={isLoading || isUpdating}

      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={tabIndex}
      {...channelOptionProps}
    >

      <div style={{ marginRight: "0.25rem" }}>{icon()}</div>

      <span className="rnf-icon">
        {channel.is_private ? <LockIcon /> : <HashtagIcon />}
      </span>
      {channel.name}
    </button>
  );
};

export default SlackChannelOption;
