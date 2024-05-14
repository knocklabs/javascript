import Knock, { AuthenticateOptions, KnockOptions } from "@knocklabs/client";
import React from "react";
import shallow from "zustand/shallow";

function authenticateWithOptions(
  knock: Knock,
  userId: string,
  userToken?: string,
  options: AuthenticateOptions = {},
) {
  knock.authenticate(userId, userToken, {
    onUserTokenExpiring: options?.onUserTokenExpiring,
    timeBeforeExpirationInMs: options?.timeBeforeExpirationInMs,
  });
}

export type AuthenticatedKnockClientOptions = KnockOptions &
  AuthenticateOptions;

function useAuthenticatedKnockClient(
  apiKey: string,
  userId: string,
  userToken?: string,
  options: AuthenticatedKnockClientOptions = {},
) {
  const knockRef = React.useRef<Knock | undefined>();
  const optionsRef = React.useRef<AuthenticatedKnockClientOptions>();

  // Shallow compare options so that we ensure that we have a stable
  // set of options between re-renders.
  const stableOptions = React.useMemo(() => {
    const currentOptions = optionsRef.current || {};
    return shallow(options, currentOptions) ? currentOptions : options;
  }, [options]);

  return React.useMemo(() => {
    const currentKnock = knockRef.current;

    // If the userId and the userToken changes then just reauth
    if (
      currentKnock &&
      currentKnock.isAuthenticated() &&
      (currentKnock.userId !== userId || currentKnock.userToken !== userToken)
    ) {
      authenticateWithOptions(currentKnock, userId, userToken, stableOptions);
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

    authenticateWithOptions(knock, userId, userToken, stableOptions);
    knockRef.current = knock;

    return knock;
  }, [apiKey, userId, userToken, stableOptions]);
}

export default useAuthenticatedKnockClient;
