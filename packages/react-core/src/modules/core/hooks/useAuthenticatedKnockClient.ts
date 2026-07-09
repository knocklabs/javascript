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
  AuthenticateOptions & {
    /**
     * When `false`, the Knock client is created but left **unauthenticated and
     * fully quiescent** — no identify, no network requests, and no real-time
     * socket activity — while children still render. Flipping it back to `true`
     * authenticates and mounts everything, like a login; flipping it to `false`
     * tears everything down, like a logout.
     *
     * The canonical use is to defer all activity until you have a complete
     * identity — e.g. an enhanced-security user token that loads asynchronously
     * (without this, a present `userId` with a not-yet-loaded token fires 401s):
     *
     * ```tsx
     * useAuthenticatedKnockClient(apiKey, { id: userId }, userToken, {
     *   enabled: Boolean(userId && userToken),
     * });
     * ```
     *
     * Defaults to `true`.
     */
    enabled?: boolean;
  };

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

  // Tracks whether the current client was torn down by a prior effect cleanup
  // (e.g. a React StrictMode simulated unmount) so we can rebuild it.
  const disposedRef = React.useRef(false);
  // Bumping this forces the memo below to build a fresh client after a teardown.
  const [generation, setGeneration] = React.useState(0);

  const { enabled = true, ...authenticateOptions } = options;

  const stableOptions = useStableOptions(authenticateOptions);
  const stableUserIdOrObject = useStableOptions(userIdOrUserWithProperties);

  const knock = React.useMemo(() => {
    // When disabled, behave as if no user was provided: null the credentials so
    // a fresh, unauthenticated client is created and stays fully quiescent. This
    // makes `enabled: false → true` behave like a login (and the reverse like a
    // logout) through the same code path headless hook consumers already use.
    const activeUserIdOrObject = enabled ? stableUserIdOrObject : undefined;
    const activeUserToken = enabled ? userToken : undefined;

    const userId =
      typeof activeUserIdOrObject === "string"
        ? activeUserIdOrObject
        : activeUserIdOrObject?.id;

    const currentKnock = knockRef.current;

    // If we already have an authenticated client and only the credentials
    // changed, just reauthenticate in place. (A userId change still remounts the
    // feed subtree downstream because `feedProviderKey` includes the userId.)
    if (
      enabled &&
      currentKnock &&
      currentKnock.isAuthenticated() &&
      (currentKnock.userId !== userId ||
        currentKnock.userToken !== activeUserToken)
    ) {
      authenticateWithOptions(
        currentKnock,
        activeUserIdOrObject,
        activeUserToken,
        stableOptions,
      );
      return currentKnock;
    }

    if (currentKnock) {
      currentKnock.teardown();
    }

    // Otherwise instantiate a new Knock client. Creating a fresh instance on
    // both the enable and disable transitions guarantees a new context identity
    // (so the feed subtree remounts and refetches) and empty stores when
    // disabling (no stale notifications/PII linger after a logout).
    const knock = new Knock(apiKey, {
      host: stableOptions.host,
      logLevel: stableOptions.logLevel,
      branch: stableOptions.branch,
    });

    authenticateWithOptions(
      knock,
      activeUserIdOrObject,
      activeUserToken,
      stableOptions,
    );
    knockRef.current = knock;

    return knock;
    // `generation` is included so a post-teardown revival (in the effect below)
    // rebuilds the client; it is intentionally not read in the memo body.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    apiKey,
    enabled,
    stableUserIdOrObject,
    userToken,
    stableOptions,
    generation,
  ]);

  // Tear the client down when the provider unmounts so we don't leak the socket,
  // the token-expiration timer, or the page-visibility listener. Uses empty deps
  // so it only fires on real unmount (transition teardown is handled in the memo
  // above, and firing here on every `knock` change would double-tear-down).
  //
  // StrictMode double-invokes effects: the simulated unmount tears the client
  // down, so on the simulated remount we rebuild a fresh one (mirrors the
  // dispose/re-init pattern in `useNotifications`).
  React.useEffect(() => {
    if (disposedRef.current) {
      disposedRef.current = false;
      setGeneration((g) => g + 1);
    }

    return () => {
      disposedRef.current = true;
      knockRef.current?.teardown();
    };
  }, []);

  return knock;
}

export default useAuthenticatedKnockClient;
