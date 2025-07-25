import { useKnockMsTeamsClient } from "..";
import { TENANT_OBJECT_COLLECTION } from "@knocklabs/client";
import { useCallback, useMemo } from "react";

import { useKnockClient } from "../../core";

const MS_TEAMS_ADMINCONSENT_URL =
  "https://login.microsoftonline.com/organizations/adminconsent";

const AUTH_REDIRECT_PATH = "/providers/ms-teams/authenticate";

interface UseMsTeamsAuthOutput {
  buildMsTeamsAuthUrl: () => string;
  disconnectFromMsTeams: () => void;
}

function useMsTeamsAuth(
  graphApiClientId: string,
  redirectUrl?: string,
): UseMsTeamsAuthOutput {
  const knock = useKnockClient();
  const {
    setConnectionStatus,
    knockMsTeamsChannelId,
    tenantId,
    setActionLabel,
  } = useKnockMsTeamsClient();

  const authRedirectUri = useMemo(
    () => knock.host + AUTH_REDIRECT_PATH,
    [knock.host],
  );

  const buildMsTeamsAuthUrl = useCallback(() => {
    const rawParams = {
      state: JSON.stringify({
        redirect_url: redirectUrl,
        ms_teams_tenant_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockMsTeamsChannelId,
        public_key: knock.apiKey,
        user_token: knock.userToken,
      }),
      client_id: graphApiClientId,
      redirect_uri: authRedirectUri,
    };
    return `${MS_TEAMS_ADMINCONSENT_URL}?${new URLSearchParams(rawParams)}`;
  }, [
    redirectUrl,
    tenantId,
    knockMsTeamsChannelId,
    knock.apiKey,
    knock.userToken,
    graphApiClientId,
    authRedirectUri,
  ]);

  const disconnectFromMsTeams = useCallback(async () => {
    setActionLabel(null);
    setConnectionStatus("disconnecting");
    try {
      const revokeResult = await knock.msTeams.revokeAccessToken({
        tenant: tenantId,
        knockChannelId: knockMsTeamsChannelId,
      });

      setConnectionStatus(revokeResult === "ok" ? "disconnected" : "error");
    } catch (_error) {
      setConnectionStatus("error");
    }
  }, [
    setConnectionStatus,
    knock.msTeams,
    tenantId,
    knockMsTeamsChannelId,
    setActionLabel,
  ]);

  return { buildMsTeamsAuthUrl, disconnectFromMsTeams };
}

export default useMsTeamsAuth;
