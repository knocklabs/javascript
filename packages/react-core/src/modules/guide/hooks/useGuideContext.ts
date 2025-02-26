import { KnockGuideClient } from "@knocklabs/client";
import * as React from "react";

import { KnockGuideContext } from "../context";

export interface UseGuideContextReturn {
  client: KnockGuideClient;
  colorMode: "light" | "dark";
}

export const useGuideContext = (): UseGuideContextReturn => {
  const context = React.useContext(KnockGuideContext);
  if (!context) {
    throw new Error("useGuide must be used within a KnockGuideProvider");
  }

  return context;
};
