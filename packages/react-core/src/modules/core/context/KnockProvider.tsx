import Knock, { AuthenticateOptions, LogLevel } from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";
import { useAuthenticatedKnockClient } from "../hooks";

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
  userId: Knock["userId"];
  userToken?: Knock["userToken"];
  onUserTokenExpiring?: AuthenticateOptions["onUserTokenExpiring"];
  timeBeforeExpirationInMs?: AuthenticateOptions["timeBeforeExpirationInMs"];
  // i18n translations
  i18n?: I18nContent;
  logLevel?: LogLevel;
}

export const KnockProvider: React.FC<PropsWithChildren<KnockProviderProps>> = ({
  apiKey,
  host,
  logLevel,
  userId,
  userToken,
  onUserTokenExpiring,
  timeBeforeExpirationInMs,
  children,
  i18n,
}) => {
  // We memoize the options here so that we don't create a new object on every re-render
  const authenticateOptions = React.useMemo(
    () => ({
      host,
      onUserTokenExpiring,
      timeBeforeExpirationInMs,
      logLevel,
    }),
    [host, onUserTokenExpiring, timeBeforeExpirationInMs, logLevel],
  );

  const knock = useAuthenticatedKnockClient(
    apiKey,
    userId,
    userToken,
    authenticateOptions,
  );

  return (
    <ProviderStateContext.Provider
      value={{
        knock,
      }}
    >
      <KnockI18nProvider i18n={i18n}>{children}</KnockI18nProvider>
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
