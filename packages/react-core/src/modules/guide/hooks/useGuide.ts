import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useStore } from "@tanstack/react-store";
import { useCallback } from "react";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

export interface UseGuideReturn extends UseGuideContextReturn {
  guide: KnockGuide | undefined;
  step: KnockGuideStep | undefined;
  markAsSeen: () => void;
  markAsInteracted: (params?: { metadata?: GenericData }) => void;
  markAsArchived: () => void;
}

export const useGuide = (filters: KnockGuideFilterParams): UseGuideReturn => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be used with at least one filter: either a guide key or a guide type",
    );
  }

  const { client, colorMode } = context;

  const [guide] = useStore(client.store, (state) =>
    client.select(state, filters),
  );

  const step = guide && guide.steps.find((s) => !s.message.archived_at);

  const markAsSeen = useCallback(() => {
    // Send a seen event if it has not been previously seen.
    if (!step || !!step.message.seen_at) return;
    client.markAsSeen(guide, step);
  }, [client, guide, step]);

  const markAsInteracted = useCallback(
    ({ metadata }: { metadata?: GenericData } = {}) => {
      // Always send an interaction event through.
      if (!step) return;
      client.markAsInteracted(guide, step, metadata);
    },
    [client, guide, step],
  );

  const markAsArchived = useCallback(() => {
    // Send an archived event if it has not been previously archived.
    if (!step || !!step.message.archived_at) return;
    client.markAsArchived(guide, step);
  }, [client, guide, step]);

  return {
    client,
    colorMode,
    guide,
    step,
    markAsSeen,
    markAsInteracted,
    markAsArchived,
  };
};
