import React, { useMemo } from "react";
import Knock, { AuthenticateOptions, KnockOptions } from "@knocklabs/client";

function useAuthenticatedKnockClient(
  apiKey: string,
  userId: string,
  userToken?: string,
  options: KnockOptions = {},
  authenticateOptions?: AuthenticateOptions,
) {
  const knockRef = React.useRef<Knock | null>();

  return useMemo(() => {
    if (knockRef.current) knockRef.current.teardown();

    const knock = new Knock(apiKey, options);
    knock.authenticate(userId, userToken, authenticateOptions);
    knockRef.current = knock;

    return knock;
  }, [apiKey, userId, userToken, options, authenticateOptions]);
}

export default useAuthenticatedKnockClient;
