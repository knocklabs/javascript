import { KnockGuide } from "@knocklabs/client";
import { UseGuideReturn, useGuide } from "@knocklabs/react-core";
import React, { useCallback, useEffect } from "react";

interface RenderProps extends UseGuideReturn {
  guide: KnockGuide;
  onInteract: () => void;
  onDismiss: () => void;
}

type Props = {
  guideKey?: string;
  messageType?: string;
  children: (renderProps: RenderProps) => React.ReactElement;
};

export const Guide: React.FC<Props> = ({ guideKey, messageType, children }) => {
  const { client, colorMode, guide } = useGuide({
    key: guideKey,
    message_type: messageType,
  });

  console.log("<Guide />")

  // Mark the guide as seen on render.
  useEffect(() => {
    if (!guide || !!guide.seen_at) return;
    client.markAsSeen(guide);
  }, [guide, client]);

  const onInteract = useCallback(() => {
    if (guide) client.markAsInteracted(guide);
  }, [guide, client]);

  const onDismiss = useCallback(() => {
    if (guide) client.markAsArchived(guide);
  }, [guide, client]);

  if (!guide || guide.archived_at) return null;

  return children({
    guide,
    client,
    colorMode,
    onInteract,
    onDismiss,
  });
};
