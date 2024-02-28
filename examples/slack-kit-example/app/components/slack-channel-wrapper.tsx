"use client";

import { SlackChannelCombobox } from "@knocklabs/react";
import { useState } from "react";

import ToggleSwitch from "./toggle-switch";

export default function SlackChannelWrapper({
  collection,
  objectId,
  className,
}: {
  collection: string;
  objectId: string;
  className: string;
}) {
  const [showConnectedChannels, setShowConnectedChannels] = useState(false);

  const slackChannelsRecipientObject = {
    objectId: objectId,
    collection: collection,
  };
  return (
    <div className={className}>
      <div className="mb-3">
      <ToggleSwitch
        label="Show connected channels"
        isToggled={showConnectedChannels}
        setIsToggled={setShowConnectedChannels}
      />
      </div>
      <SlackChannelCombobox
        slackChannelsRecipientObject={slackChannelsRecipientObject}
        showConnectedChannelTags={showConnectedChannels}
      />
    </div>
  );
}
