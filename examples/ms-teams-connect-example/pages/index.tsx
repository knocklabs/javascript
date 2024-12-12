import {
  KnockMSTeamsProvider,
  KnockProvider,
  MSTeamsAuthButton,
} from "@knocklabs/react";

export default function Home() {
  const user = {
    id: "123",
    email: "",
    name: "",
    phone_number: "",
    avatar: "",
    updated_at: "",
    created_at: "",
  };

  return (
    <KnockProvider
      apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
      userId={user.id}
      host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
    >
      <KnockMSTeamsProvider
        knockMSTeamsChannelId={
          process.env.NEXT_PUBLIC_KNOCK_MS_TEAMS_CHANNEL_ID!
        }
        tenantId={process.env.NEXT_PUBLIC_TENANT_ID!}
      >
        <h1
          style={{
            margin: "0 0 20px",
            fontFamily: "monospace",
            fontSize: "40px",
            fontWeight: "normal",
          }}
        >
          MS Teams connector examples
        </h1>
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
              MS Teams Connector options
            </div>
            <div style={{ margin: "10px", padding: "10px" }}>
              <MSTeamsAuthButton
                msTeamsBotId={process.env.NEXT_PUBLIC_KNOCK_MS_TEAMS_BOT_ID!}
              />
            </div>
          </div>
        </div>
      </KnockMSTeamsProvider>
    </KnockProvider>
  );
}
