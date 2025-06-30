import Knock from "@knocklabs/client";
import { useEffect, useState } from "react";

import { useTranslations } from "../../i18n";

// Connection based on https://api.slack.com/methods/auth.test#examples
// Also includes x-oauth-scopes
type SlackConnectionSuccess = {
  ok: true;
  url: string;
  team: string;
  user: string;
  team_id: string;
  user_id: string;
  bot_id?: string;
  scopes?: string[];
};

type SlackConnectionError = {
  ok: false;
  error: string;
};

export type SlackConnection = SlackConnectionSuccess | SlackConnectionError;

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

type UseSlackConnectionStatusOutput = {
  connection: SlackConnection | null;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (errorLabel: string) => void;
  actionLabel: string | null;
  setActionLabel: (actionLabel: string | null) => void;
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

function useSlackConnectionStatus(
  knock: Knock,
  knockSlackChannelId: string,
  tenantId: string,
): UseSlackConnectionStatusOutput {
  const { t } = useTranslations();
  const [connection, setConnection] = useState<SlackConnection | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (connectionStatus !== "connecting") return;

      try {
        const authRes = await knock.slack.authCheck({
          tenant: tenantId,
          knockChannelId: knockSlackChannelId,
        });

        setConnection(authRes.connection);

        if (authRes.connection?.ok) {
          return setConnectionStatus("connected");
        }

        if (!authRes.connection?.ok) {
          return setConnectionStatus("disconnected");
        }

        // This is a normal response for a tenant that doesn't have an access
        // token set on it, meaning it's not connected to Slack, so we
        // give it a "disconnected" status instead of an error status.
        if (
          authRes.code === "ERR_BAD_REQUEST" &&
          authRes.response?.data?.message === t("slackAccessTokenNotSet")
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
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
  }, [connectionStatus, tenantId, knockSlackChannelId, knock.slack, t]);

  return {
    connection,
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  };
}

export default useSlackConnectionStatus;
