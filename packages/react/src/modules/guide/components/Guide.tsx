import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { UseGuideReturn, useGuide } from "@knocklabs/react-core";
import React, { useCallback, useEffect } from "react";

// TODO: Add a generic type variable for content.
interface RenderProps extends UseGuideReturn {
  guide: KnockGuide;
  step: KnockGuideStep;
  onInteract: () => void;
  onDismiss: () => void;
}

type Props = {
  filters: KnockGuideFilterParams;
  children: (renderProps: RenderProps) => React.ReactElement;
};

export const Guide: React.FC<Props> = ({ filters, children }) => {
  const { client, colorMode, guide } = useGuide(filters);
  const step = guide && guide.steps.find((s) => !s.message.archived_at);

  // Mark the guide as seen on render.
  useEffect(() => {
    if (!step || !!step.message.seen_at) return;
    client.markAsSeen(guide, step);
  }, [client, guide, step]);

  const onInteract = useCallback(() => {
    if (!step || !!step.message.interacted_at) return;
    client.markAsInteracted(guide, step);
  }, [client, guide, step]);

  const onDismiss = useCallback(() => {
    if (!step || !!step.message.archived_at) return;
    client.markAsArchived(guide, step);
  }, [client, guide, step]);

  if (!guide || !step) return null;

  return children({
    guide,
    step,
    client,
    colorMode,
    onInteract,
    onDismiss,
  });
};
