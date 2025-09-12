import Knock, {
  AuthenticateOptions,
  KnockOptions,
  UserId,
  UserIdOrUserWithProperties,
} from "@knocklabs/client";
import React from "react";

import { useStableOptions } from "../../core";

function authenticateWithOptions(
  knock: Knock,
  userIdOrUserWithProperties: UserIdOrUserWithProperties,
  userToken?: Knock["userToken"],
  options: AuthenticateOptions = {},
) {
  knock.authenticate(userIdOrUserWithProperties, userToken, {
    onUserTokenExpiring: options?.onUserTokenExpiring,
    timeBeforeExpirationInMs: options?.timeBeforeExpirationInMs,
    identificationStrategy: options?.identificationStrategy,
  });
}

export type AuthenticatedKnockClientOptions = KnockOptions &
  AuthenticateOptions;

/**
 * @deprecated Passing `userId` as a `string` is deprecated and will be removed in a future version.
 * Please pass a `user` object instead containing an `id` value.
 * example:
 * ```ts
 * useAuthenticatedKnockClient("pk_test_12345", { id: "user_123" });
 * ```
 */
function useAuthenticatedKnockClient(
  apiKey: string,
  userIdOrUserWithProperties: UserId,
  userToken?: Knock["userToken"],
  options?: AuthenticatedKnockClientOptions,
): Knock;
function useAuthenticatedKnockClient(
  apiKey: string,
  userIdOrUserWithProperties: UserIdOrUserWithProperties,
  userToken?: Knock["userToken"],
  options?: AuthenticatedKnockClientOptions,
): Knock;
function useAuthenticatedKnockClient(
  apiKey: string,
  userIdOrUserWithProperties: UserIdOrUserWithProperties,
  userToken?: Knock["userToken"],
  options: AuthenticatedKnockClientOptions = {},
) {
  const knockRef = React.useRef<Knock | undefined>(undefined);

  const stableOptions = useStableOptions(options);
  const stableUserIdOrObject = useStableOptions(userIdOrUserWithProperties);

  return React.useMemo(() => {
    const userId =
      typeof stableUserIdOrObject === "string"
        ? stableUserIdOrObject
        : stableUserIdOrObject?.id;

    const currentKnock = knockRef.current;

    // If the userId and the userToken changes then just reauth
    if (
      currentKnock &&
      currentKnock.isAuthenticated() &&
      (currentKnock.userId !== userId || currentKnock.userToken !== userToken)
    ) {
      authenticateWithOptions(
        currentKnock,
        stableUserIdOrObject,
        userToken,
        stableOptions,
      );
      return currentKnock;
    }

    if (currentKnock) {
      currentKnock.teardown();
    }

    // Otherwise instantiate a new Knock client
    const knock = new Knock(apiKey, {
      host: stableOptions.host,
      logLevel: stableOptions.logLevel,
    });

    authenticateWithOptions(
      knock,
      stableUserIdOrObject,
      userToken,
      stableOptions,
    );
    knockRef.current = knock;

    return knock;
  }, [apiKey, stableUserIdOrObject, userToken, stableOptions]);
}

export default useAuthenticatedKnockClient;
