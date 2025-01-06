import { useKnockMSTeamsClient } from "..";
import { TENANT_OBJECT_COLLECTION } from "@knocklabs/client";
import { useCallback } from "react";

import { useKnockClient } from "../../core";

const MS_TEAMS_ADMINCONSENT_URL =
  "https://login.microsoftonline.com/organizations/adminconsent";

// @ts-expect-error env vars are statically replaced by Vite at build time
const REDIRECT_URI = import.meta.env.VITE_MS_TEAMS_REDIRECT_URI;

interface UseMSTeamsAuthOutput {
  buildMSTeamsAuthUrl: () => string;
  disconnectFromMSTeams: () => void;
}

function useMSTeamsAuth(
  msTeamsBotId: string,
  redirectUrl?: string,
): UseMSTeamsAuthOutput {
  const knock = useKnockClient();
  const {
    setConnectionStatus,
    knockMSTeamsChannelId,
    tenantId,
    setActionLabel,
  } = useKnockMSTeamsClient();

  const buildMSTeamsAuthUrl = useCallback(() => {
    const rawParams = {
      state: JSON.stringify({
        redirect_url: redirectUrl,
        ms_teams_tenant_object: {
          object_id: tenantId,
          collection: TENANT_OBJECT_COLLECTION,
        },
        channel_id: knockMSTeamsChannelId,
        public_key: knock.apiKey,
        user_token: knock.userToken,
      }),
      client_id: msTeamsBotId,
      redirect_uri: REDIRECT_URI,
    };
    return `${MS_TEAMS_ADMINCONSENT_URL}?${new URLSearchParams(rawParams)}`;
  }, [
    redirectUrl,
    tenantId,
    knockMSTeamsChannelId,
    knock.apiKey,
    knock.userToken,
    msTeamsBotId,
  ]);

  const disconnectFromMSTeams = useCallback(async () => {
    setActionLabel(null);
    setConnectionStatus("disconnecting");
    try {
      const revokeResult = await knock.msTeams.revokeAccessToken({
        tenant: tenantId,
        knockChannelId: knockMSTeamsChannelId,
      });

      setConnectionStatus(revokeResult === "ok" ? "disconnected" : "error");
    } catch (_error) {
      setConnectionStatus("error");
    }
  }, [
    setConnectionStatus,
    knock.msTeams,
    tenantId,
    knockMSTeamsChannelId,
    setActionLabel,
  ]);

  return { buildMSTeamsAuthUrl, disconnectFromMSTeams };
}

export default useMSTeamsAuth;
