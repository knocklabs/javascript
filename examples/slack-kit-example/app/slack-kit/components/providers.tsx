"use client";

import { KnockProvider, KnockSlackProvider } from "@knocklabs/react";

export default function Providers({
  knockToken,
  knockUserId,
  tenant,
  children,
}: {
  knockToken: string;
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
        userToken={knockToken}
      >
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
