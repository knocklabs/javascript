import {
  KnockProvider,
  KnockSlackProvider,
  SlackAuthButton,
  SlackAuthContainer,
  SlackChannelCombobox,
} from "@knocklabs/react";
import { useState } from "react";

import { ToggleSwitch } from "../components";
import { useSetToken } from "../hooks";

export default function Home() {
  const [showConnectedChannels, setShowConnectedChannels] = useState(false);
  const tenant = process.env.NEXT_PUBLIC_TENANT!;
  const user = {
    id: "123",
    email: "",
    name: "",
    phone_number: "",
    avatar: "",
    updated_at: "",
    created_at: "",
  };
  const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL;

  const slackChannelsRecipientObject = {
    objectId: process.env.NEXT_PUBLIC_CONNECTIONS_OBJECT_ID!,
    collection: process.env.NEXT_PUBLIC_CONNECTIONS_COLLECTION!,
  };

  const onAuthComplete = (result: string) => {
    console.log("Result from Slack authentication:", result);
  };

  const { isLoading, isError } = useSetToken({
    tenant,
    user,
    slackChannelsRecipientObject,
  });

  if (isLoading) {
    return <div> Loading... </div>;
  }

  if (isError) {
    return <div> Not found </div>;
  }

  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
      userId={user.id}
      host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
      userToken={localStorage.getItem("knock-user-token")!}
    >
      <KnockSlackProvider
        knockSlackChannelId={process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID!}
        tenantId={tenant}
      >
        <>
          <div
            style={{
              marginBottom: "20px",
              fontFamily: "monospace",
              fontSize: "40px",
            }}
          >
            Slack connector examples
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div
                style={{
                  marginBottom: "10px",
                  marginTop: "40px",
                  fontFamily: "monospace",
                  fontSize: "25px",
                  color: "gray",
                }}
              >
                Slack Channel Picker
              </div>
              <ToggleSwitch
                label="Show connected channels"
                isToggled={!!showConnectedChannels}
                setIsToggled={setShowConnectedChannels}
              />
              <div style={{ margin: "10px", padding: "10px" }}>
                <SlackChannelCombobox
                  slackChannelsRecipientObject={slackChannelsRecipientObject}
                  showConnectedChannelTags={showConnectedChannels}
                />
              </div>
            </div>
            <div>
              <div
                style={{
                  marginBottom: "10px",
                  marginTop: "40px",
                  fontFamily: "monospace",
                  fontSize: "25px",
                  color: "gray",
                }}
              >
                Slack Connector options
              </div>

              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    marginTop: "40px",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    color: "gray",
                  }}
                >
                  Button
                </div>
                <div style={{ margin: "10px", padding: "10px" }}>
                  <SlackAuthButton
                    slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
                    redirectUrl={redirectUrl}
                    onAuthenticationComplete={onAuthComplete}
                  />
                </div>
              </div>

              <div
                style={{
                  marginBottom: "10px",
                  marginTop: "40px",
                  fontFamily: "monospace",
                  fontSize: "18px",
                  color: "gray",
                }}
              >
                Container with button
              </div>
              <div style={{ margin: "10px", padding: "10px" }}>
                <SlackAuthContainer
                  actionButton={
                    <SlackAuthButton
                      slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
                      redirectUrl={redirectUrl}
                    />
                  }
                />
              </div>
            </div>
          </div>
        </>
      </KnockSlackProvider>
    </KnockProvider>
  );
}
