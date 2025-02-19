import { Flex, NativeSelect, Spinner } from "@chakra-ui/react";
import {
  useAuthenticatedKnockClient,
  useNotificationStore,
  useNotifications,
} from "@knocklabs/react";
import { useEffect, useState } from "react";

import { MarkdownContentBlock } from "../../../packages/client/dist/types/clients/feed/interfaces";
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
    { tenant },
  );

  const { items, metadata } = useNotificationStore(feedClient);

  useEffect(() => {
    feedClient.fetch();
  }, [feedClient]);

  return (
    <div className="notifications">
      <NativeSelect.Root
        mr={3}
        size="sm"
      >
        <NativeSelect.Field value={tenant} onChange={(e) => setTenant(e.target.value)}>
          {Object.values(Tenants).map((tenant) => (
            <option key={tenant} value={tenant}>
              {TenantLabels[tenant]}
            </option>
          ))}
        </NativeSelect.Field>
      </NativeSelect.Root>

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
      <Flex
        alignItems="center"
        justifyContent="center"
        width="100vw"
        height="100vh"
      >
        <Spinner />
      </Flex>
    );
  }

  return <HeadlessFeed userId={userId} userToken={userToken} />;
}
