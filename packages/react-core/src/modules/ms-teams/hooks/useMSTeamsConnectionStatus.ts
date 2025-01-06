import Knock from "@knocklabs/client";
import { useEffect, useState } from "react";

import { useTranslations } from "../../i18n";

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

type UseMSTeamsConnectionStatusOutput = {
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  errorLabel: string | null;
  setErrorLabel: (errorLabel: string) => void;
  actionLabel: string | null;
  setActionLabel: (actionLabel: string | null) => void;
};

function useMSTeamsConnectionStatus(
  knock: Knock,
  knockMSTeamsChannelId: string,
  tenantId: string,
): UseMSTeamsConnectionStatusOutput {
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
          tenantId,
          knockChannelId: knockMSTeamsChannelId,
        });

        if (authRes.connection?.ok) {
          return setConnectionStatus("connected");
        }

        if (!authRes.connection?.ok) {
          return setConnectionStatus("disconnected");
        }

        // This is a normal response for a tenant that doesn't have an access
        // token set on it, meaning it's not connected to MSTeams, so we
        // give it a "disconnected" status instead of an error status.
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
  }, [connectionStatus, tenantId, knockMSTeamsChannelId, knock.msTeams, t]);

  return {
    connectionStatus,
    setConnectionStatus,
    errorLabel,
    setErrorLabel,
    actionLabel,
    setActionLabel,
  };
}

export default useMSTeamsConnectionStatus;
