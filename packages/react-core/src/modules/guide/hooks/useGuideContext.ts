import {
  KnockGuideClient,
  KnockGuideContentTypesMapping,
} from "@knocklabs/client";
import * as React from "react";

import { KnockGuideContext } from "../context";

export interface UseGuideContextReturn<
  M extends KnockGuideContentTypesMapping = KnockGuideContentTypesMapping,
> {
  client: KnockGuideClient<M>;
  colorMode: "light" | "dark";
}

export const useGuideContext = <
  M extends KnockGuideContentTypesMapping = KnockGuideContentTypesMapping,
>(): UseGuideContextReturn<M> => {
  const context = React.useContext(KnockGuideContext);

  if (!context) {
    throw new Error("useGuideContext must be used within a KnockGuideProvider");
  }

  return context;
};
