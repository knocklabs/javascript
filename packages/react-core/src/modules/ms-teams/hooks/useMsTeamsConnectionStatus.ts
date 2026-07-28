import Knock from "@knocklabs/client";
import { useEffect, useRef, useState } from "react";

import { useKnockAuthState } from "../../core/hooks/useKnockAuthState";
import { type ConnectionStatus } from "../../core/types";
import { useTranslations } from "../../i18n";

type UseMsTeamsConnectionStatusOutput = {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (errorLabel: string) => void;
  actionLabel: string | null;
  setActionLabel: (actionLabel: string | null) => void;
};

function useMsTeamsConnectionStatus(
  knock: Knock,
  knockMsTeamsChannelId: string,
  tenantId: string,
): UseMsTeamsConnectionStatusOutput {
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
      setActionLabel(null);
    }
  }, [userId]);

  useEffect(() => {
    let ignore = false;

    const checkAuthStatus = async () => {
      if (connectionStatus !== "connecting") return;

      try {
        const authRes = await knock.msTeams.authCheck({
          tenant: tenantId,
          knockChannelId: knockMsTeamsChannelId,
        });

        // A newer user/tenant/instance superseded this check while it was in
        // flight; drop its result so we don't latch the previous user's status.
        if (ignore) return;

        if (authRes.connection?.ok === true) {
          return setConnectionStatus("connected");
        }

        if (authRes.connection?.ok === false) {
          return setConnectionStatus("disconnected");
        }

        // This is a normal response for a tenant that doesn't have
        // ms_teams_tenant_id set on it, meaning it's not connected to MS Teams,
        // so we give it a "disconnected" status instead of an error status.
        const responseStatus = authRes.response?.status;
        if (
          typeof responseStatus === "number" &&
          responseStatus >= 400 &&
          responseStatus < 500 &&
          authRes.response?.data?.message === t("msTeamsTenantIdNotSet")
        ) {
          return setConnectionStatus("disconnected");
        }

        // This is for any Knock errors that would require a reconnect.
        setConnectionStatus("error");
      } catch (_error) {
        if (ignore) return;
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
    return () => {
      ignore = true;
    };
  }, [
    connectionStatus,
    tenantId,
    knockMsTeamsChannelId,
    knock.msTeams,
    t,
    userId,
  ]);

  return {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  };
}

export default useMsTeamsConnectionStatus;
