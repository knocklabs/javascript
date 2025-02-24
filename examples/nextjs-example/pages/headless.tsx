import { MarkdownContentBlock } from "@knocklabs/client";
import {
  useAuthenticatedKnockClient,
  useNotificationStore,
  useNotifications,
} from "@knocklabs/react";
import { Box, Stack } from "@telegraph/layout";
import { Select } from "@telegraph/select";
import { useEffect, useState } from "react";

import useIdentify from "../hooks/useIdentify";

const Tenants = {
  TeamA: "team-a",
  TeamB: "team-b",
};

const TenantLabels = {
  [Tenants.TeamA]: "Team A",
  [Tenants.TeamB]: "Team B",
};

const HeadlessFeed = ({
  userId,
  userToken,
}: {
  userId: string;
  userToken?: string;
}) => {
  const [tenant, setTenant] = useState(Tenants.TeamA);

  const knockClient = useAuthenticatedKnockClient(
    process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!,
    userId,
    userToken,
    { host: process.env.NEXT_PUBLIC_KNOCK_HOST, logLevel: "debug" },
  );

  const feedClient = useNotifications(
    knockClient,
    process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!,
    {
      tenant,
      trigger_data: { isEnterprise: true },
    },
  );

  // Example of using a selector to access a subset of the store state (not required)
  const { items, metadata } = useNotificationStore(feedClient, (state) => ({
    items: state.items,
    metadata: state.metadata,
  }));

  console.log(items);

  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

  return (
    <div className="notifications">
      <Box marginRight="2">
        <Select.Root
          size="2"
          value={tenant}
          onValueChange={(value) => setTenant(value as typeof tenant)}
        >
          {Object.values(Tenants).map((tenant) => (
            <Select.Option key={tenant} value={tenant}>
              {TenantLabels[tenant]}
            </Select.Option>
          ))}
        </Select.Root>
      </Box>

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
};

export default function Headless() {
  const { userId, isLoading, userToken } = useIdentify();

  if (isLoading || !userId) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        style={{
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="spinner" aria-label="Loading..." />
      </Stack>
    );
  }

  return <HeadlessFeed userId={userId} userToken={userToken} />;
}
