import { useKnockSlackClient } from "..";
import { TENANT_OBJECT_COLLECTION } from "@knocklabs/client";
import { useCallback } from "react";

import { useKnockClient } from "../../core";

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const DEFAULT_SLACK_SCOPES = [
  "chat:write",
  "chat:write.public",
  "channels:read",
  "groups:read",
];

type UseSlackAuthOutput = {
  buildSlackAuthUrl: () => string;
  disconnectFromSlack: () => void;
};

type UseSlackAuthOptions = {
  // When provided, the default scopes will be overridden with the provided scopes
  scopes?: string[];
  // Additional scopes to add to the default scopes
  additionalScopes?: string[];
};

// Here we normalize the options to be a single object with scopes and additionalScopes
// The "options" parameter can be an array of scopes, an object with scopes and additionalScopes, or undefined
// We handle the array case because it was the previous way to pass options so we're being backward compatible
function normalizeOptions(options?: UseSlackAuthOptions | string[]): {
  scopes: string[];
  additionalScopes: string[];
} {
  if (!options) {
    return { scopes: DEFAULT_SLACK_SCOPES, additionalScopes: [] };
  }

  if (Array.isArray(options)) {
    return { scopes: DEFAULT_SLACK_SCOPES, additionalScopes: options };
  }

  return {
    scopes: options.scopes ?? DEFAULT_SLACK_SCOPES,
    additionalScopes: options.additionalScopes ?? [],
  };
}

function useSlackAuth(
  slackClientId: string,
  redirectUrl?: string,
  options?: UseSlackAuthOptions | string[],
): UseSlackAuthOutput {
  const knock = useKnockClient();
  const { setConnectionStatus, knockSlackChannelId, tenantId, setActionLabel } =
    useKnockSlackClient();

  const { scopes, additionalScopes } = normalizeOptions(options);
  const combinedScopes = Array.from(new Set(scopes.concat(additionalScopes)));

  const disconnectFromSlack = useCallback(async () => {
    setActionLabel(null);
    setConnectionStatus("disconnecting");
    try {
      const revoke = await knock.slack.revokeAccessToken({
        tenant: tenantId,
        knockChannelId: knockSlackChannelId,
      });

      if (revoke === "ok") {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("error");
      }
    } catch (_error) {
      setConnectionStatus("error");
    }
  }, [
    setConnectionStatus,
    knock.slack,
    tenantId,
    knockSlackChannelId,
    setActionLabel,
  ]);

  const buildSlackAuthUrl = useCallback(() => {
    const state: Record<string, unknown> = {
      redirect_url: redirectUrl,
      access_token_object: {
        object_id: tenantId,
        collection: TENANT_OBJECT_COLLECTION,
      },
      channel_id: knockSlackChannelId,
      public_key: knock.apiKey,
      user_token: knock.userToken,
    };

    if (knock.branch) {
      state.branch_slug = knock.branch;
    }

    const rawParams = {
      state: JSON.stringify(state),
      client_id: slackClientId,
      scope: combinedScopes.join(","),
    };

    return `${SLACK_AUTHORIZE_URL}?${new URLSearchParams(rawParams)}`;
  }, [
    redirectUrl,
    tenantId,
    knockSlackChannelId,
    knock.apiKey,
    knock.userToken,
    knock.branch,
    slackClientId,
    combinedScopes,
  ]);

  return {
    buildSlackAuthUrl,
    disconnectFromSlack,
  };
}

export default useSlackAuth;
