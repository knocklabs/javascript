import { KnockGuide, KnockGuideFilterParams } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

export interface UseGuideReturn extends UseGuideContextReturn {
  guide: KnockGuide | undefined;
}

export const useGuide = (filters: KnockGuideFilterParams): UseGuideReturn => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be used with at least one filter: either a guide key or a guide type",
    );
  }

  const { client } = context;
  const [guide] = useStore(client.store, (state) =>
    client.select(state, filters),
  );

  return { ...context, guide };
};
