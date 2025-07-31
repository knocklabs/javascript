import { KnockGuide, KnockGuideFilterParams } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

interface UseGuidesReturn extends UseGuideContextReturn {
  guides: KnockGuide[];
}

export const useGuides = (filters: KnockGuideFilterParams): UseGuidesReturn => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuides must be given at least one filter: { key?: string; type?: string; }",
    );
  }

  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides(state, filters),
  );

  return { client, colorMode, guides };
};
