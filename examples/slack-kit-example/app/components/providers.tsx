"use client";

import { KnockProvider, KnockSlackProvider } from "@knocklabs/react";

export default function Providers({
  userToken,
  knockUserId,
  tenant,
  children,
}: {
  userToken: string;
  knockUserId: string;
  tenant: string;
  children: JSX.Element;
}) {
  return (
    <>
      <KnockProvider
        apiKey={process.env.NEXT_PUBLIC_KNOCK_CLIENT_ID!}
        userId={knockUserId}
        host={process.env.NEXT_PUBLIC_KNOCK_API_URL}
        userToken={userToken}
      >
        {/* 
        The KnockProvider handles authentication with Knock, while the KnockSlackProvider
        provides shared context to all Slack-related components. 
        Both are required for Slack-related apps.
        */}
        <KnockSlackProvider
          knockSlackChannelId={process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID!}
          tenant={tenant}
        >
          {children}
        </KnockSlackProvider>
      </KnockProvider>
    </>
  );
}
