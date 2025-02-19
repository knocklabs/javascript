"use client";

import { SlackChannelCombobox } from "@knocklabs/react";

export default function SlackChannelWrapper({
  collection,
  objectId,
  className,
}: {
  collection: string;
  objectId: string;
  className: string;
}) {
  const slackChannelsRecipientObject = {
    objectId: objectId,
    collection: collection,
  };
  return (
    <div className={className}>
      <SlackChannelCombobox
        slackChannelsRecipientObject={slackChannelsRecipientObject}
      />
    </div>
  );
}
