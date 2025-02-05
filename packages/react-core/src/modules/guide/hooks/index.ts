import { useStore } from "@tanstack/react-store";
import * as React from "react";

import { KnockGuideContext } from "../context";

export const useGuides = (messageType: string) => {
  const context = React.useContext(KnockGuideContext);
  if (!context) {
    throw new Error("useGuides must be used within a KnockGuideProvider");
  }

  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides(state, { message_type: messageType }),
  );

  return { guides, client, colorMode };
};

export const useGuide = (guideKey: string) => {
  const context = React.useContext(KnockGuideContext);
  if (!context) {
    throw new Error("useGuide must be used within a KnockGuideProvider");
  }

  const { client, colorMode } = context;

  const [guide] = useStore(client.store, (state) =>
    client.selectGuides(state, { key: guideKey }),
  );

  return { guide, client, colorMode };
};
