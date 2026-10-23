import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
} from "@knocklabs/react";
import { Box } from "@telegraph/layout";

/**
 * Display the Knock Notification Feed without the need of the "use client" directive.
 */

export default async function Home() {
  return (
    <Box maxW="160" border="px" rounded="3" p="4" mx="auto" mt="8">
      <KnockProvider
        user={{ id: process.env.NEXT_PUBLIC_KNOCK_USER_ID! }}
        apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!}
        host={process.env.NEXT_PUBLIC_KNOCK_HOST}
      >
        <KnockFeedProvider
          feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!}
        >
          <NotificationFeed />
        </KnockFeedProvider>
      </KnockProvider>
    </Box>
  );
}
