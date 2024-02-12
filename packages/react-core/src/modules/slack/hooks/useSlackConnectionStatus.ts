import Knock from "@knocklabs/client";
import { useEffect, useState } from "react";

export type ConnectionStatus =
  | "loading"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

type UseManageSlackConnectionOutput = {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (errorLabel: string) => void;
  actionLabel: string | null;
  setActionLabel: (actionLabel: string) => void;
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
  knockSlackChannelId: string,
  tenant: string,
  knock: Knock,
): UseManageSlackConnectionOutput {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("loading");
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setActionLabel("");
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

  return {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  };
}

export default useSlackConnectionStatus;
