import Knock from "@knocklabs/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";
import { useAuthenticatedKnockClient } from "../hooks";

const queryClient = new QueryClient();

export interface KnockProviderState {
  knock: Knock;
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

  // i18n translations
  i18n?: I18nContent;
}

export const KnockProvider: React.FC<KnockProviderProps> = ({
  apiKey,
  host,
  userId,
  userToken,
  children,
  i18n,
}) => {
  const knock = useAuthenticatedKnockClient(apiKey, userId, userToken, {
    host,
  });

  return (
    <ProviderStateContext.Provider
      value={{
        knock,
      }}
    >
      <KnockI18nProvider i18n={i18n}>
        {/**
         * TODO 5211: Move this QueryClientProvider into the SlackProvider when we create it MKD
         * https://linear.app/knock/issue/KNO-5211/[react]-add-knockslackprovider
         *  */}
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </KnockI18nProvider>
    </ProviderStateContext.Provider>
  );
};

export const useKnockClient = (): Knock => {
  const context = React.useContext(ProviderStateContext) as KnockProviderState;
  if (context === undefined) {
    throw new Error("useKnock must be used within a KnockProvider");
  }
  return context.knock;
};
