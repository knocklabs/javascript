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

function useSlackAuth(
  slackClientId: string,
  redirectUrl?: string,
  additionalScopes?: string[],
): UseSlackAuthOutput {
  const knock = useKnockClient();
  const { setConnectionStatus, knockSlackChannelId, tenantId, setActionLabel } =
    useKnockSlackClient();

  const combinedScopes =
    additionalScopes && additionalScopes.length > 0
      ? Array.from(new Set(DEFAULT_SLACK_SCOPES.concat(additionalScopes)))
      : DEFAULT_SLACK_SCOPES;

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
    const rawParams = {
      state: JSON.stringify({
        redirect_url: redirectUrl,
        access_token_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockSlackChannelId,
        public_key: knock.apiKey,
        user_token: knock.userToken,
      }),
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
    slackClientId,
    combinedScopes,
  ]);

  return {
    buildSlackAuthUrl,
    disconnectFromSlack,
  };
}

export default useSlackAuth;
