import { SlackChannel } from "@knocklabs/client";
import { useEffect, useState } from "react";
import { FunctionComponent } from "react";

import { Spinner } from "../../../core";
import "../../theme.css";

import HashtagIcon from "./icons/HashtagIcon";
import LockIcon from "./icons/LockIcon";
import "./styles.css";

export interface SlackChannelOptionProps {
  channel: SlackChannel;
  isLoading: boolean;
  isConnected: boolean;
  onClick: (id: string) => void;
  tabIndex: number;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
  isUpdating: boolean;
}

const SlackChannelOption: FunctionComponent<SlackChannelOptionProps> = ({
  channel,
  isLoading,
  isConnected,
  onClick,
  tabIndex,
  channelOptionProps,
  isUpdating,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const icon = () => {
    if (submittedId === channel.id && (isUpdating || isLoading)) {
      return <Spinner thickness={3} />;
    }

    if (isHovered || isConnected) {
      return "✅";
    }

    return <div className="rsk-combobox__option__text-container__empty-icon" />;
  };

  const handleOptionClick = (channelId: string) => {
    setSubmittedId(channelId);
    onClick(channelId);
  };

  useEffect(() => {
    if (submittedId && !isUpdating) {
      return setSubmittedId(null);
    }
  }, [isLoading, isUpdating, submittedId]);

  return (
    <button
      key={channel.id}
      className="rsk-combobox__option__button"
      onClick={() => !isLoading && handleOptionClick(channel.id)}
      disabled={isLoading || isUpdating}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      tabIndex={tabIndex}
      {...channelOptionProps}
    >
      <div className="rsk-combobox__option__text-container">
        <div className="rsk-combobox__option__text-container__connection-icon">
          {icon()}
        </div>
        <div className="rsk-combobox__option__text-container__channel-icon">
          {channel.is_private ? <LockIcon /> : <HashtagIcon />}
        </div>
        <div className="rsk-combobox__option__text-container__text">
          {channel.name}
        </div>
      </div>
    </button>
  );
};

export default SlackChannelOption;
