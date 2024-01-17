import useSetToken from "../hooks/useSetToken";
import {
  ConnectToSlackButton,
  ConnectToSlackContainer,
  ConnectedSlackChannelPicker,
  KnockProvider,
} from "@knocklabs/react";

export default function Home() {
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
  const redirectUrl = "http://localhost:3001/";

  const connectionsObject = {
    objectId: process.env.NEXT_PUBLIC_CONNECTIONS_OBJECT_ID!,
    collection: process.env.NEXT_PUBLIC_CONNECTIONS_COLLECTION!,
  };

  const { isLoading, isError } = useSetToken({
    tenant,
    user,
    connectionsObject,
  });

  if (isLoading) {
    return <div> Loading... </div>;
  }

  if (isError) {
    return <div> Not found </div>;
  }

  return (
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
          <div style={{ margin: "10px", padding: "10px" }}>
            <KnockProvider
              apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
              userId={user.id}
              host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
              userToken={localStorage.getItem("knock-user-token")!}
            >
              <ConnectedSlackChannelPicker
                user={user}
                tenant={tenant}
                connectionsObject={connectionsObject}
                knockSlackChannelId={
                  process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID!
                }
              />
            </KnockProvider>
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
              <KnockProvider
                apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
                userId={user.id}
                host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
                userToken={localStorage.getItem("knock-user-token")!}
              >
                <ConnectToSlackButton
                  tenant={tenant}
                  knockSlackChannelId={
                    process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID!
                  }
                  slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
                  redirectUrl={redirectUrl}
                />
              </KnockProvider>
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
            <KnockProvider
              apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
              userId={user.id}
              host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
              userToken={localStorage.getItem("knock-user-token")!}
            >
              <ConnectToSlackContainer
                actionButton={
                  <ConnectToSlackButton
                    tenant={tenant}
                    knockSlackChannelId={
                      process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID!
                    }
                    slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
                    redirectUrl={redirectUrl}
                  />
                }
              />
            </KnockProvider>
          </div>
        </div>
      </div>
    </>
  );
}
