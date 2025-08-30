import {
  KnockGuide,
  KnockGuideContentTypesMapping,
  KnockGuideFilterParams,
  KnockGuideMatchContentType,
  KnockGuideStep,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

interface UseGuideReturn<M extends KnockGuideContentTypesMapping, C>
  extends UseGuideContextReturn<M> {
  guide: KnockGuide<C> | undefined;
  step: KnockGuideStep<C> | undefined;
}

export const useGuide = <
  M extends KnockGuideContentTypesMapping = KnockGuideContentTypesMapping,
  F extends KnockGuideFilterParams = KnockGuideFilterParams,
>(
  filters: F,
): UseGuideReturn<M, KnockGuideMatchContentType<M, F>> => {
  const context = useGuideContext<M>();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be given at least one filter: { key?: string; type?: string; }",
    );
  }

  const { client, colorMode } = context;

  const guide = useStore(client.store, (state) =>
    client.selectGuide(state, filters),
  );

  const step = guide && guide.getStep();

  return { client, colorMode, guide, step };
};

// Helper type to bind useGuide with the content types mapping, so that the
// filter arg "as const" for the hook can be inferred by ts.
export type UseGuideWithContentTypes<M extends KnockGuideContentTypesMapping> =
  <F extends KnockGuideFilterParams>(
    filters: F,
  ) => UseGuideReturn<M, KnockGuideMatchContentType<M, F>>;
