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
   * Controls whether the KnockProvider should authenticate and initialize the Knock client.
   * When set to false, the provider will skip authentication and just render children.
   * This is useful for preventing auth errors when user credentials are not yet available.
   * @default true
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

const AuthenticatedKnockProvider: React.FC<
  PropsWithChildren<
    Omit<KnockProviderProps, "enabled"> & { enabled: true | undefined }
  >
> = ({
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
    }),
    [
      host,
      onUserTokenExpiring,
      timeBeforeExpirationInMs,
      logLevel,
      identificationStrategy,
      branch,
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

export const KnockProvider: React.FC<PropsWithChildren<KnockProviderProps>> = ({
  enabled = true,
  children,
  i18n,
  ...props
}) => {
  // When disabled, skip authentication but still provide i18n context
  if (!enabled) {
    return <KnockI18nProvider i18n={i18n}>{children}</KnockI18nProvider>;
  }

  return (
    <AuthenticatedKnockProvider enabled={enabled} i18n={i18n} {...props}>
      {children}
    </AuthenticatedKnockProvider>
  );
};

export const useKnockClient = (): Knock => {
  const context = React.useContext(KnockContext);
  if (!context) {
    throw new Error("useKnockClient must be used within a KnockProvider");
  }
  return context.knock;
};
