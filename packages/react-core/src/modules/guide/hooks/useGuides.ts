import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockSelectGuidesOpts,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

interface UseGuidesReturn<C = Any> extends UseGuideContextReturn {
  guides: KnockGuide<C>[];
}

export const useGuides = <C = Any>(
  filters: Pick<KnockGuideFilterParams, "type">,
  opts?: KnockSelectGuidesOpts,
): UseGuidesReturn<C> => {
  const context = useGuideContext();
  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides<C>(state, filters, opts),
  );

  return { client, colorMode, guides };
};
