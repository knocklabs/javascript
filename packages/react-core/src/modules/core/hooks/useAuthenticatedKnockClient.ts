import React, { useMemo } from "react";
import Knock, { AuthenticateOptions, KnockOptions } from "@knocklabs/client";

function useAuthenticatedKnockClient(
  apiKey: string,
  userId: string,
  userToken?: string,
  options: KnockOptions & AuthenticateOptions = {},
) {
  const knockRef = React.useRef<Knock | null>();

  return useMemo(() => {
    if (knockRef.current) knockRef.current.teardown();

    const knock = new Knock(apiKey, options);
    knock.authenticate(userId, userToken, {
      onUserTokenExpiring: options?.onUserTokenExpiring,
      timeBeforeExpirationInMs: options?.timeBeforeExpirationInMs,
    });
    knockRef.current = knock;

    return knock;
  }, [apiKey, userId, userToken, options]);
}

export default useAuthenticatedKnockClient;
