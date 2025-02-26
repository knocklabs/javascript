import Knock from "@knocklabs/client";
import { useEffect, useState } from "react";

import { useTranslations } from "../../i18n";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

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

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");
  const [errorLabel, setErrorLabel] = useState<string | null>(null);
  const [actionLabel, setActionLabel] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (connectionStatus !== "connecting") return;

      try {
        const authRes = await knock.msTeams.authCheck({
          tenant: tenantId,
          knockChannelId: knockMsTeamsChannelId,
        });

        if (authRes.connection?.ok === true) {
          return setConnectionStatus("connected");
        }

        if (authRes.connection?.ok === false) {
          return setConnectionStatus("disconnected");
        }

        // This is a normal response for a tenant that doesn't have
        // ms_teams_tenant_id set on it, meaning it's not connected to MS Teams,
        // so we give it a "disconnected" status instead of an error status.
        if (
          authRes.code === "ERR_BAD_REQUEST" &&
          authRes.response?.data?.message === t("msTeamsTenantIdNotSet")
        ) {
          return setConnectionStatus("disconnected");
        }

        // This is for any Knock errors that would require a reconnect.
        setConnectionStatus("error");
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    checkAuthStatus();
  }, [connectionStatus, tenantId, knockMsTeamsChannelId, knock.msTeams, t]);

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
