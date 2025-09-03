import { KnockGuide, KnockGuideFilterParams } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface UseGuidesReturn<C = Any> extends UseGuideContextReturn {
  guides: KnockGuide<C>[];
}

export const useGuides = <C = Any>(
  filters: Pick<KnockGuideFilterParams, "type">,
): UseGuidesReturn<C> => {
  const context = useGuideContext();
  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides(state, filters),
  );

  return { client, colorMode, guides };
};
