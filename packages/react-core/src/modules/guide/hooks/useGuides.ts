import {
  KnockGuide,
  KnockGuideContentTypesMapping,
  KnockGuideFilterParams,
  KnockGuideMatchContentType,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

interface UseGuidesReturn<M extends KnockGuideContentTypesMapping, C>
  extends UseGuideContextReturn<M> {
  guides: KnockGuide<C>[];
}

export const useGuides = <
  M extends KnockGuideContentTypesMapping = KnockGuideContentTypesMapping,
  F extends KnockGuideFilterParams = KnockGuideFilterParams,
>(
  filters: F,
): UseGuidesReturn<M, KnockGuideMatchContentType<M, F>> => {
  const context = useGuideContext<M>();
  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides(state, filters),
  );

  return { client, colorMode, guides };
};

// Helper type to bind useGuide with the content types mapping, so that the
// filter arg "as const" for the hook can be inferred by ts.
export type UseGuidesWithContentTypes<M extends KnockGuideContentTypesMapping> =
  <F extends KnockGuideFilterParams>(
    filters: F,
  ) => UseGuidesReturn<M, KnockGuideMatchContentType<M, F>>;
