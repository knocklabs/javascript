import Knock, { AuthenticateOptions, LogLevel } from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";
import { useAuthenticatedKnockClient } from "../hooks";

export interface KnockProviderState {
  knock: Knock;
}

const KnockContext = React.createContext<KnockProviderState | null>(null);

export interface KnockProviderProps {
  // Knock client props
  apiKey: string;
  host?: string;
  // Authentication props
  userId: string;
  userToken?: string;
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
    <KnockContext.Provider
      value={{
        knock,
      }}
    >
      <KnockI18nProvider i18n={i18n}>{children}</KnockI18nProvider>
    </KnockContext.Provider>
  );
};

export const useKnockClient = (): Knock => {
  const context = React.useContext(KnockContext);
  if (!context) {
    throw new Error("useKnockClient must be used within a KnockProvider");
  }
  return context.knock;
};
