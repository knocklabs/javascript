import { useKnockClient } from "@knocklabs/react-core";
import { SlackIcon } from "../SlackIcon";
import "./styles.css";

export const SLACK_AUTHORIZE_URL = "https://slack.com/oauth/v2/authorize";
const TENANT_COLLECTION = "$tenants";

type Props = {
  tenant: string;
  knockSlackChannelId: string;
  slackClientId: string;
  redirectUrl?: string;
};

export const ConnectToSlackButton: React.FC<Props> = ({
  tenant,
  knockSlackChannelId,
  slackClientId,
  redirectUrl,
}) => {
  const knock = useKnockClient();

  const rawParams = {
    state: JSON.stringify({
      redirect_url: redirectUrl,
      access_token_object: {
        object_id: tenant,
        collection: TENANT_COLLECTION,
      },
      channel_id: knockSlackChannelId,
      public_key: knock.apiKey,
      user_token: knock.userToken,
    }),
    client_id: slackClientId,
    scope: "chat:write,chat:write.public,channels:read,groups:read",
  } as Record<string, string>;
  const params = new URLSearchParams(rawParams);

  return (
    <a
      href={`${SLACK_AUTHORIZE_URL}?${params}`}
      className="rnf-link"
      style={{ width: "150px" }}
    >
      <SlackIcon height="16px" width="16px" />
      <span className="rnf-textContainer">Connect to Slack</span>
    </a>
  );
};
