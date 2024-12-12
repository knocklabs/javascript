import { useKnockMSTeamsClient } from "..";
import { TENANT_OBJECT_COLLECTION } from "@knocklabs/client";
import { useCallback } from "react";

import { useKnockClient } from "../../core";

const MS_TEAMS_ADMINCONSENT_URL =
  "https://login.microsoftonline.com/organizations/adminconsent";

// TODO Implement /authenticate endpoint
const REDIRECT_URI = "https://api.knock.app/providers/msteams/authenticate";

interface UseMSTeamsAuthOutput {
  buildMSTeamsAuthUrl: () => string;
}

function useMSTeamsAuth(
  msTeamsBotId: string,
  redirectUrl?: string,
): UseMSTeamsAuthOutput {
  const knock = useKnockClient();
  const { knockMSTeamsChannelId, tenantId } = useKnockMSTeamsClient();

  const buildMSTeamsAuthUrl = useCallback(() => {
    const rawParams = {
      state: JSON.stringify({
        redirect_url: redirectUrl,
        access_token_object: {
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

  return { buildMSTeamsAuthUrl };
}

export default useMSTeamsAuth;
