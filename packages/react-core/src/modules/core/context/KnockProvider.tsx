import Knock, {
  AuthenticateOptions,
  LogLevel,
  UserWithProperties,
} from "@knocklabs/client";
import * as React from "react";
import { PropsWithChildren } from "react";

import { I18nContent, KnockI18nProvider } from "../../i18n";

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
  enabled = true,
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

  // Create and manage Knock client instance
  const [forceUpdate, setForceUpdate] = React.useState(0);
  const knockClient = React.useMemo(
    () => {
      const knock = new Knock(apiKey ?? "", {
        host: authenticateOptions.host,
        logLevel: authenticateOptions.logLevel,
        branch: authenticateOptions.branch,
      });

      // Authenticate synchronously on creation if enabled
      if (enabled && userIdOrUserWithProperties) {
        knock.authenticate(userIdOrUserWithProperties, userToken, {
          onUserTokenExpiring: authenticateOptions.onUserTokenExpiring,
          timeBeforeExpirationInMs:
            authenticateOptions.timeBeforeExpirationInMs,
          identificationStrategy: authenticateOptions.identificationStrategy,
        });
      }

      return knock;
    },
    // We intentionally omit enabled, userIdOrUserWithProperties, and userToken
    // to reuse the same instance when these change. Auth state changes are handled
    // in the effect below via resetAuthentication()/authenticate() calls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, authenticateOptions, forceUpdate],
  );

  // Track previous enabled state to detect transitions
  const prevEnabledRef = React.useRef(enabled);

  React.useEffect(() => {
    const wasEnabled = prevEnabledRef.current;
    const isEnabled = enabled;

    if (wasEnabled && !isEnabled && knockClient.isAuthenticated()) {
      // Transitioning from enabled→disabled: reset auth and force update
      knockClient.resetAuthentication();
      setForceUpdate((n) => n + 1);
    } else if (!wasEnabled && isEnabled && userIdOrUserWithProperties) {
      // Transitioning from disabled→enabled: authenticate
      knockClient.authenticate(userIdOrUserWithProperties, userToken, {
        onUserTokenExpiring: authenticateOptions.onUserTokenExpiring,
        timeBeforeExpirationInMs: authenticateOptions.timeBeforeExpirationInMs,
        identificationStrategy: authenticateOptions.identificationStrategy,
      });
      setForceUpdate((n) => n + 1);
    } else if (isEnabled && userIdOrUserWithProperties) {
      // If enabled and user/token changed, reauthenticate
      const userId =
        typeof userIdOrUserWithProperties === "string"
          ? userIdOrUserWithProperties
          : userIdOrUserWithProperties?.id;

      if (
        knockClient.userId !== userId ||
        knockClient.userToken !== userToken
      ) {
        knockClient.authenticate(userIdOrUserWithProperties, userToken, {
          onUserTokenExpiring: authenticateOptions.onUserTokenExpiring,
          timeBeforeExpirationInMs:
            authenticateOptions.timeBeforeExpirationInMs,
          identificationStrategy: authenticateOptions.identificationStrategy,
        });
      }
    }

    prevEnabledRef.current = enabled;
  }, [
    enabled,
    knockClient,
    userIdOrUserWithProperties,
    userToken,
    authenticateOptions,
  ]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      knockClient.teardown();
    };
  }, [knockClient]);

  return (
    <KnockContext.Provider value={{ knock: knockClient }}>
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
