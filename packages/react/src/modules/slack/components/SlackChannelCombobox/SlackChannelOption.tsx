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
    if ((submittedId === channel.id && (isUpdating || isLoading))) {
      return <Spinner thickness={3} />;
    }

    if (isHovered || isConnected) {
      return <CheckmarkIcon isConnected={isConnected} />;
    }

    return <div/>;
  };

  const handleOptionClick = (channelId: string) => {
    setSubmittedId(channelId);
    onClick(channelId);
  };

  useEffect(() => {
    if (submittedId && (!isUpdating)) {
      return setSubmittedId(null);
    }
  }, [isLoading, isUpdating, submittedId]);

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
      <div style={{ display: "flex", gap: "0.25rem", height: "20px" }}>
        <div style={{width: "20px"}}>{icon()}</div>
        <div className="rnf-icon">
          {channel.is_private ? <LockIcon /> : <HashtagIcon />}
        </div>
      </div>
      {channel.name}
    </button>
  );
};

export default SlackChannelOption;
