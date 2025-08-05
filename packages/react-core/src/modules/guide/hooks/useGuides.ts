import { KnockGuide, KnockGuideFilterParams } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

interface UseGuidesReturn extends UseGuideContextReturn {
  guides: KnockGuide[];
}

export const useGuides = (
  filters: Pick<KnockGuideFilterParams, "type">,
): UseGuidesReturn => {
  const context = useGuideContext();
  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides(state, filters),
  );

  return { client, colorMode, guides };
};
