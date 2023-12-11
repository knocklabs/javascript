import * as React from "react";
import Knock from "@knocklabs/client";

import { ColorMode } from "../constants";
import { useAuthenticatedKnockClient } from "../hooks";
import { KnockI18nProvider, I18nContent } from "../../i18n";

export interface KnockProviderState {
  knock: Knock;
  colorMode: ColorMode;
}

const ProviderStateContext = React.createContext<KnockProviderState | null>(
  null,
);

export interface KnockProviderProps {
  // Knock client props
  apiKey: string;
  host?: string;
  // Authentication props
  userId: string;
  userToken?: string;

  // Extra options
  children?: React.ReactElement;
  colorMode?: ColorMode;

  // i18n translations
  i18n?: I18nContent;
}

export const KnockProvider: React.FC<KnockProviderProps> = ({
  apiKey,
  host,
  userId,
  userToken,
  children,
  colorMode = "light",
  i18n,
}) => {
  const knock = useAuthenticatedKnockClient(apiKey, userId, userToken, {
    host,
  });

  return (
    <ProviderStateContext.Provider
      value={{
        knock,
        colorMode,
      }}
    >
      <KnockI18nProvider i18n={i18n}>{children}</KnockI18nProvider>
    </ProviderStateContext.Provider>
  );
};

export const useKnock = (): KnockProviderState => {
  const context = React.useContext(ProviderStateContext);
  if (context === undefined) {
    throw new Error("useKnock must be used within a KnockProvider");
  }
  return context as KnockProviderState;
};
