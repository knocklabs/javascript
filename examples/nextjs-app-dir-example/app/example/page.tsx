"use client";

import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeedContainer,
} from "@knocklabs/react";
import { Icon } from "@telegraph/icon";
import { Box, Stack } from "@telegraph/layout";
import { Select } from "@telegraph/select";
import { Heading, Text } from "@telegraph/typography";
import { FileCode, Github } from "lucide-react";
import { useCallback, useState } from "react";

import NotificationFeed from "@/components/NotificationFeed";
import NotificationToasts from "@/components/NotificationToasts";
import SendNotificationForm from "@/components/SendNotificationForm";
import useIdentify from "@/hooks/useIdentify";

const Tenants = {
  TeamA: "team-a",
  TeamB: "team-b",
};

const TenantLabels = {
  [Tenants.TeamA]: "Team A",
  [Tenants.TeamB]: "Team B",
};

export default function Example() {
  const { userId, userToken } = useIdentify();
  const [tenant, setTenant] = useState(Tenants.TeamA);

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
      <KnockFeedProvider
        feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!}
        defaultFeedOptions={{ tenant }}
      >
        <NotificationFeedContainer>
          <Box style={{ maxWidth: "500px" }} mx="auto" py="12">
            <Stack mb="8">
              <Stack flexDirection="column" gap="2">
                <Heading size="6" as="h1">
                  React in-app notifications example
                </Heading>
                <Text as="p">
                  This is an example application to show in-app notifications{" "}
                  <Text as="span" color="blue">
                    <a href="https://knock.app" color="accent">
                      powered by Knock
                    </a>
                  </Text>
                  .
                </Text>
              </Stack>
            </Stack>
            <Stack
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Heading size="4" as="h2">
                Send an in-app notification
              </Heading>
              <Stack alignItems="center">
                <Select.Root
                  size="3"
                  aria-label="Team"
                  value={tenant}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      setTenant(value);
                    }
                  }}
                >
                  {Object.values(Tenants).map((tenant) => (
                    <Select.Option key={tenant} value={tenant}>
                      {TenantLabels[tenant]}
                    </Select.Option>
                  ))}
                </Select.Root>
                <Box marginLeft="2">
                  <NotificationFeed />
                </Box>
              </Stack>
            </Stack>
            <SendNotificationForm userId={userId} tenant={tenant} />
            <NotificationToasts />
            <Box
              marginTop="12"
              borderTopWidth="1"
              borderTopColor="gray-5"
              paddingTop="4"
            >
              <Stack justifyContent="space-between" alignItems="center">
                <a href="https://github.com/knocklabs/in-app-notifications-example-nextjs">
                  <Stack direction="row" alignItems="center" gap="1">
                    <Icon
                      aria-hidden={true}
                      alt="GitHub"
                      icon={Github}
                      color="gray"
                    />
                    <Text as="span" color="gray">
                      Github repo
                    </Text>
                  </Stack>
                </a>
                <a href="https://docs.knock.app/in-app-ui/react/overview">
                  <Stack direction="row" alignItems="center" gap="1">
                    <Icon
                      aria-hidden={true}
                      alt="GitHub"
                      icon={FileCode}
                      color="gray"
                    />
                    <Text as="span" color="gray">
                      Documentation
                    </Text>
                  </Stack>
                </a>
                <a href="https://knock.app">
                  <Text as="span" color="gray">
                    Powered by{" "}
                    <Text as="span" color="accent">
                      Knock
                    </Text>
                  </Text>
                </a>
              </Stack>
            </Box>
          </Box>
        </NotificationFeedContainer>
      </KnockFeedProvider>
    </KnockProvider>
  );
}
