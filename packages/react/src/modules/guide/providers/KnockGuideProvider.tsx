import {
  KnockGuideProvider as KnockGuideProviderCore,
  type KnockGuideProviderProps,
} from "@knocklabs/react-core";
import React from "react";

import { ToolbarV1, ToolbarV2 } from "../components";

type Props = KnockGuideProviderProps & {
  toolbar?: "v1" | "v2";
};

// Re-export the core KnockGuideProvider, so we can add React specific
// functionality like the Toolbar component which shouldn't be included in other
// contexts (e.g. React Native).
export const KnockGuideProvider: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  toolbar = "v2",
  readyToTarget,
  ...props
}) => {
  return (
    <KnockGuideProviderCore
      {...props}
      readyToTarget={readyToTarget}
      // For backward compatibility with toolbar v1. Remove once v2 ships.
      trackDebugParams={toolbar === "v1"}
    >
      {children}
      {toolbar === "v2" ? (
        <ToolbarV2 readyToTarget={readyToTarget} />
      ) : (
        <ToolbarV1 />
      )}
    </KnockGuideProviderCore>
  );
};
