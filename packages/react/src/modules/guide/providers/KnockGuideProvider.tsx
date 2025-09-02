import {
  KnockGuideProvider as KnockGuideProviderCore,
  type KnockGuideProviderProps,
} from "@knocklabs/react-core";
import React from "react";

import { GuideToolbar } from "../components";

// Re-export the core KnockGuideProvider, so we can add React specific functionality
// like the GuideToolbar component which shouldn't be included in other contexts (e.g. React Native).
export const KnockGuideProvider: React.FC<
  React.PropsWithChildren<KnockGuideProviderProps>
> = ({ children, ...props }) => {
  return (
    <KnockGuideProviderCore {...props}>
      {children}
      <GuideToolbar />
    </KnockGuideProviderCore>
  );
};
