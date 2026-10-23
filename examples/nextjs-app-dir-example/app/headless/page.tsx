"use client";

import { MarkdownContentBlock } from "@knocklabs/client";
import {
  KnockProvider,
  useKnockClient,
  useNotificationStore,
  useNotifications,
} from "@knocklabs/react";
import { useCallback, useEffect } from "react";

import useIdentify from "@/hooks/useIdentify";

// Follows this guide as setup to create a custom notifications UI
// https://docs.knock.app/in-app-ui/react/custom-notifications-ui

function ProviderComponent({ children }: { children: React.ReactNode }) {
  const { userId, userToken } = useIdentify();

  const tokenRefreshHandler = useCallback(async () => {
    // Refresh the user token 1s before it expires
    const res = await fetch(`/api/auth?id=${userId}`);
    const json = await res.json();

    return json.userToken;
  }, [userId]);

  return (
    <KnockProvider
      userId={userId}
      userToken={userToken}
      apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!}
      host={process.env.NEXT_PUBLIC_KNOCK_HOST}
      onUserTokenExpiring={tokenRefreshHandler}
      timeBeforeExpirationInMs={5000}
      logLevel="debug"
    >
      {children}
    </KnockProvider>
  );
}

function NotificationFeed() {
  const knockClient = useKnockClient();
  const feedClient = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID as string,
  );

  const { items, metadata } = useNotificationStore(feedClient);

  console.log({ items, metadata });

  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

  return (
    <div className="notifications">
      <span>You have {metadata.unread_count} unread items</span>
      {items.map((item) => (
        <div key={item.id}>
          <div
            dangerouslySetInnerHTML={{
              __html: (item.blocks[0] as MarkdownContentBlock).rendered,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <ProviderComponent>
      <NotificationFeed />
    </ProviderComponent>
  );
}
