import {
  KnockGuide,
  KnockGuideClient,
  KnockGuideFilterParams,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";
import * as React from "react";

import { KnockGuideContext } from "../context";

export interface UseGuideReturn {
  guide: KnockGuide | undefined;
  client: KnockGuideClient;
  colorMode: "light" | "dark";
}

export const useGuide = (filters: KnockGuideFilterParams): UseGuideReturn => {
  const context = React.useContext(KnockGuideContext);
  if (!context) {
    throw new Error("useGuide must be used within a KnockGuideProvider");
  }

  if (!filters.key && !filters.message_type) {
    throw new Error(
      "useGuide must be given at least one: a guide key or a message type",
    );
  }

  const { client, colorMode } = context;

  const [guide] = useStore(client.store, (state) =>
    client.select(state, filters),
  );

  return { guide, client, colorMode };
};
