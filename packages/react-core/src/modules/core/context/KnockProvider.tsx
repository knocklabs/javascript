import Knock, {
  AuthenticateOptions,
  LogLevel,
  UserWithProperties,
} from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";
import { useAuthenticatedKnockClient } from "../hooks";

export interface KnockProviderState {
  knock: Knock;
}

const KnockContext = React.createContext<KnockProviderState | null>(null);

export type KnockProviderProps = {
  // Knock client props
  apiKey: string | undefined;
  host?: string;
  userToken?: Knock["userToken"];
  onUserTokenExpiring?: AuthenticateOptions["onUserTokenExpiring"];
  timeBeforeExpirationInMs?: AuthenticateOptions["timeBeforeExpirationInMs"];
  // i18n translations
  i18n?: I18nContent;
  logLevel?: LogLevel;
  branch?: string;
  /**
   * When `false`, render children but keep the Knock client unauthenticated and
   * fully quiescent — no identify, network, or socket activity. Flipping it to
   * `true` authenticates and mounts everything (like a login); flipping it back
   * to `false` tears everything down (like a logout). Defaults to `true`.
   *
   * This is the recommended way to gate the provider on a complete identity —
   * e.g. an enhanced-security token that loads asynchronously — instead of
   * conditionally mounting `KnockProvider`:
   *
   * ```tsx
   * <KnockProvider
   *   apiKey={apiKey}
   *   user={{ id: userId }}
   *   userToken={userToken}
   *   enabled={Boolean(userId && userToken)}
   * >
   * ```
   */
  enabled?: boolean;
} & (
  | {
      /**
       * @deprecated The `userId` prop is deprecated and will be removed in a future version.
       * Please pass the `user` prop instead containing an `id` value.
       * example:
       * ```ts
       * <KnockProvider user={{ id: "user_123" }}></KnockProvider>
       * ```
       */
      userId: Knock["userId"];
      user?: never;
      identificationStrategy?: never;
    }
  | {
      user: UserWithProperties;
      identificationStrategy?: AuthenticateOptions["identificationStrategy"];
      /**
       * @deprecated The `userId` prop is deprecated and will be removed in a future version.
       * Please pass the `user` prop instead containing an `id` value.
       * example:
       * ```ts
       * <KnockProvider user={{ id: "user_123" }}></KnockProvider>
       * ```
       */
      userId?: never;
    }
);

export const KnockProvider: React.FC<PropsWithChildren<KnockProviderProps>> = ({
  apiKey,
  host,
  logLevel,
  userToken,
  onUserTokenExpiring,
  timeBeforeExpirationInMs,
  children,
  i18n,
  identificationStrategy,
  branch,
  enabled,
  ...props
}) => {
  const userIdOrUserWithProperties = props?.user || props?.userId;

  // We memoize the options here so that we don't create a new object on every re-render
  const authenticateOptions = React.useMemo(
    () => ({
      host,
      onUserTokenExpiring,
      timeBeforeExpirationInMs,
      logLevel,
      identificationStrategy,
      branch,
      enabled,
    }),
    [
      host,
      onUserTokenExpiring,
      timeBeforeExpirationInMs,
      logLevel,
      identificationStrategy,
      branch,
      enabled,
    ],
  );

  const knock = useAuthenticatedKnockClient(
    apiKey ?? "",
    userIdOrUserWithProperties,
    userToken,
    authenticateOptions,
  );

  return (
    <KnockContext.Provider value={{ knock }}>
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
