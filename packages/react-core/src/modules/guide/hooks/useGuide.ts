import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface UseGuideReturn<C = Any> extends UseGuideContextReturn {
  guide: KnockGuide<C> | undefined;
  step: KnockGuideStep<C> | undefined;
}

export const useGuide = <C = Any>(
  filters: KnockGuideFilterParams,
): UseGuideReturn<C> => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be given at least one filter: { key?: string; type?: string; }",
    );
  }

  const { client, colorMode } = context;

  const guide = useStore(client.store, (state) =>
    client.selectGuide<C>(state, filters),
  );

  const step = guide && guide.getStep();

  return { client, colorMode, guide, step };
};
