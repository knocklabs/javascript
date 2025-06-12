import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

interface UseGuideReturn extends UseGuideContextReturn {
  guide: KnockGuide | undefined;
  step: KnockGuideStep | undefined;
}

export const useGuide = (filters: KnockGuideFilterParams): UseGuideReturn => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be used with at least one filter: either a guide key or a guide type",
    );
  }

  const { client, colorMode } = context;

  const guide = useStore(client.store, (state) =>
    client.selectGuide(state, filters),
  );

  const step = guide && guide.steps.find((s) => !s.message.archived_at);

  return { client, colorMode, guide, step };
};
