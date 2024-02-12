import { useKnockClient } from "@knocklabs/react-core";
import { useState, useEffect, useCallback } from "react";

const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const TENANT_OBJECT_COLLECTION = "$tenants";
const DEFAULT_SLACK_SCOPES = [
  "chat:write",
  "chat:write.public",
  "channels:read",
  "groups:read",
  "groups:write",
];

type ConnectionStatus =
  | "loading"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

type UseManageSlackConnectionProps = {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (errorLabel: string) => void;
  actionLabel: string | null;
  setActionLabel: (actionLabel: string) => void;
  buildSlackAuthUrl: () => string;
  disconnectFromSlack: () => void;
};

/**
 * Transforms a slack error message into
 * a formatted one. Slack error messages: https://api.slack.com/methods/auth.test#errors
 *
 * Ex.: "account_inactive" -> "Account inactive"
 */
const formatSlackErrorMessage = (errorMessage: string) => {
  const firstLetter = errorMessage.substring(0, 1).toUpperCase();
  const rest = errorMessage.substring(1);
  return firstLetter?.concat(rest).replace("_", " ");
};

export function useManageSlackConnection(
  knockSlackChannelId: string,
  tenant: string,
  slackClientId: string,
  redirectUrl?: string,
): UseManageSlackConnectionProps {
  const knock = useKnockClient();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("loading");
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (connectionStatus !== "loading") return;

      try {
        const authRes = await knock.slack.authCheck({
          tenant,
          knockChannelId: knockSlackChannelId,
        });

        if (authRes.connection?.ok) {
          setConnectionStatus("connected");
          return;
        }

        // This is a normal response for a tenant that doesn't have an access
        // token set on it, meaning it's not connected to Slack, so we
        // give it a "disconnected" status instead of an error status.
        if (
          authRes.code === "ERR_BAD_REQUEST" &&
          authRes.response?.data?.message === "Access token not set."
        ) {
          return setConnectionStatus("disconnected");
        }

        // This is for an error coming directly from Slack.
        if (!authRes.connection?.ok && authRes.connection?.error) {
          const errorLabel = formatSlackErrorMessage(authRes.connection?.error);
          setErrorLabel(errorLabel);
          setConnectionStatus("error");

          return;
        }

        // This is for any Knock errors that would require a reconnect.
        setConnectionStatus("error");
      } catch (error) {
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
  }, [connectionStatus, tenant, knockSlackChannelId, knock.slack]);

  const disconnectFromSlack = useCallback(async () => {
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
  }, [tenant, knockSlackChannelId, setConnectionStatus, knock.slack]);

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
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
    buildSlackAuthUrl,
    disconnectFromSlack,
  };
}
