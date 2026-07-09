import Knock from "@knocklabs/client";
import { useEffect, useRef, useState } from "react";

import { useKnockAuthState } from "../../core/hooks/useKnockAuthState";
import { type ConnectionStatus } from "../../core/types";
import { useTranslations } from "../../i18n";

type UseSlackConnectionStatusOutput = {
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
  const { userId } = useKnockAuthState(knock);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  // When the authenticated user changes (login, logout, or switch), reset back
  // to "connecting" so the effect below re-runs `authCheck` for the new user
  // instead of leaving the previous user's latched status in place.
  const previousUserIdRef = useRef(userId);
  useEffect(() => {
    if (previousUserIdRef.current !== userId) {
      previousUserIdRef.current = userId;
      setConnectionStatus("connecting");
      setErrorLabel(null);
    }
  }, [userId]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (connectionStatus !== "connecting") return;

      try {
        const authRes = await knock.slack.authCheck({
          tenant: tenantId,
          knockChannelId: knockSlackChannelId,
        });

        if (authRes.connection?.ok) {
          return setConnectionStatus("connected");
        }

        // This is a normal response for a tenant that doesn't have an access
        // token set on it, meaning it's not connected to Slack, so we
        // give it a "disconnected" status instead of an error status.
        const responseStatus = authRes.response?.status;
        if (
          typeof responseStatus === "number" &&
          responseStatus >= 400 &&
          responseStatus < 500 &&
          authRes.response?.data?.message === t("slackAccessTokenNotSet")
        ) {
          return setConnectionStatus("disconnected");
        }

        // This is for an error coming directly from Slack.
        if (authRes.connection && authRes.connection.error) {
          const errorLabel = formatSlackErrorMessage(authRes.connection.error);
          setErrorLabel(errorLabel);
          setConnectionStatus("error");
          return;
        }

        if (authRes.connection) {
          return setConnectionStatus("disconnected");
        }

        setConnectionStatus("error");
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
  }, [connectionStatus, tenantId, knockSlackChannelId, knock.slack, t]);

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
