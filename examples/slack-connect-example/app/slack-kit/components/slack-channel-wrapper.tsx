"use client";

import { SlackChannelCombobox } from "@knocklabs/react";

export default function SlackChannelWrapper({
  collection,
  objectId,
}: {
  collection: string;
  objectId: string;
}) {
  const connectionsObject = {
    objectId: objectId,
    collection: collection,
  };
  return <SlackChannelCombobox connectionsObject={connectionsObject} />;
}
