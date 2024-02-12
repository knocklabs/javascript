import { useKnockSlackClient } from "..";
import { useCallback } from "react";

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const TENANT_OBJECT_COLLECTION = "$tenants";
const DEFAULT_SLACK_SCOPES = [
  "chat:write",
  "chat:write.public",
  "channels:read",
  "groups:read",
  "groups:write",
];

type UseManageSlackConnectionOutput = {
  buildSlackAuthUrl: () => string;
  disconnectFromSlack: () => void;
};

function useManageSlackConnection(
  slackClientId: string,
  redirectUrl?: string,
): UseManageSlackConnectionOutput {
  const {
    setConnectionStatus,
    knock,
    knockSlackChannelId,
    tenant,
    setActionLabel,
  } = useKnockSlackClient();

  const disconnectFromSlack = useCallback(async () => {
    setActionLabel("");
    setConnectionStatus("disconnecting");
    try {
      const revoke = await knock.slack.revokeAccessToken({
        tenant,
        knockChannelId: knockSlackChannelId,
      });

      if (revoke === "ok") {
        setConnectionStatus("disconnected");
      } else {
        setConnectionStatus("error");
      }
    } catch (error) {
      setConnectionStatus("error");
    }
  }, [
    setConnectionStatus,
    knock.slack,
    tenant,
    knockSlackChannelId,
    setActionLabel,
  ]);

  const buildSlackAuthUrl = useCallback(() => {
    const rawParams = {
      state: JSON.stringify({
        redirect_url: redirectUrl,
        access_token_object: {
          object_id: tenant,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockSlackChannelId,
        public_key: knock.apiKey,
        user_token: knock.userToken,
      }),
      client_id: slackClientId,
      scope: DEFAULT_SLACK_SCOPES.join(","),
    };
    return `${SLACK_AUTHORIZE_URL}?${new URLSearchParams(rawParams)}`;
  }, [
    redirectUrl,
    tenant,
    knockSlackChannelId,
    knock.apiKey,
    knock.userToken,
    slackClientId,
  ]);

  return {
    buildSlackAuthUrl,
    disconnectFromSlack,
  };
}

export default useManageSlackConnection;
