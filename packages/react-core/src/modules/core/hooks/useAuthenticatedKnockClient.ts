import Knock, { AuthenticateOptions, KnockOptions } from "@knocklabs/client";
import React, { useMemo } from "react";

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

function useAuthenticatedKnockClient(
  apiKey: string,
  userId: string,
  userToken?: string,
  options: KnockOptions & AuthenticateOptions = {},
) {
  const knockRef = React.useRef<Knock | null>();

  return useMemo(() => {
    const currentKnock = knockRef.current;

    // If the userId and the userToken changes then just reauth
    if (
      currentKnock &&
      currentKnock.isAuthenticated() &&
      (currentKnock.userId !== userId || currentKnock.userToken !== userToken)
    ) {
      authenticateWithOptions(currentKnock, userId, userToken, options);
      return currentKnock;
    }

    if (currentKnock) {
      currentKnock.teardown();
    }

    // Otherwise instantiate a new Knock client
    const knock = new Knock(apiKey, options);
    authenticateWithOptions(knock, userId, userToken, options);
    knockRef.current = knock;

    return knock;
  }, [apiKey, userId, userToken, options]);
}

export default useAuthenticatedKnockClient;
