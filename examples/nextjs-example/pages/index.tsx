import {
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  Select,
  Spinner,
  Text,
} from "@chakra-ui/react";
import {
  KnockFeedProvider,
  KnockProvider,
  NotificationCell,
  NotificationFeed,
  NotificationFeedContainer,
} from "@knocklabs/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IoDocument, IoLogoGithub } from "react-icons/io5";

import NextNotificationFeed from "../components/NotificationFeed";
import NotificationToasts from "../components/NotificationToasts";
import SendNotificationForm from "../components/SendNotificationForm";
import useIdentify from "../hooks/useIdentify";

const Tenants = {
  TeamA: "team-a",
  TeamB: "team-b",
};

const TenantLabels = {
  [Tenants.TeamA]: "Team A",
  [Tenants.TeamB]: "Team B",
};

export default function Home() {
  const { userId, isLoading, userToken } = useIdentify();
  const [uid, setUid] = useState(userId);
  const [tenant, setTenant] = useState(Tenants.TeamA);

  console.log({ userId });

  const notifRef = useRef(null);

  const tokenRefreshHandler = useCallback(async () => {
    // Refresh the user token 1s before it expires
    const res = await fetch(`/api/auth?id=${userId}`);
    const json = await res.json();

    return json.userToken;
  }, [userId]);

  useEffect(() => {
    setUid(userId);
  }, [userId]);

  const [show, setShow] = useState(false);

  if (isLoading) {
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

  return (
    <>
      <button
        onClick={() => {
          if (uid === userId) {
            setUid(null);
          } else {
            setUid(userId);
          }
        }}
      >
        Toggle - {uid}
      </button>
      {true ? (
        <KnockProvider
          userId={uid}
          userToken={userToken}
          apiKey={process.env.NEXT_PUBLIC_KNOCK_PUBLIC_API_KEY!}
          host={process.env.NEXT_PUBLIC_KNOCK_HOST}
          // onUserTokenExpiring={tokenRefreshHandler}
          // timeBeforeExpirationInMs={5000}
          logLevel="debug"
        >
          <KnockFeedProvider
            feedId={process.env.NEXT_PUBLIC_KNOCK_FEED_CHANNEL_ID!}
            defaultFeedOptions={{ tenant }}
          >
            <NotificationFeedContainer>
              <Box maxW="520px" mx="auto" py={12}>
                <Flex mb={8}>
                  <Box>
                    <Heading size="md" mb={2}>
                      React in-app notifications example
                    </Heading>

                    <Text>
                      This is an example application to show in-app
                      notifications{" "}
                      <Link
                        href="https://knock.app"
                        color="blue.600"
                        fontWeight="semibold"
                      >
                        powered by Knock
                      </Link>
                      .
                    </Text>
                  </Box>
                </Flex>

                <Flex>
                  <Heading size="sm" mb={3}>
                    Send an in-app notification
                  </Heading>

                  <Flex ml="auto" alignItems="center">
                    <Select
                      mr={3}
                      size="sm"
                      value={tenant}
                      onChange={(e) => setTenant(e.target.value)}
                    >
                      {Object.values(Tenants).map((tenant) => (
                        <option key={tenant} value={tenant}>
                          {TenantLabels[tenant]}
                        </option>
                      ))}
                    </Select>

                    <NextNotificationFeed />
                  </Flex>
                </Flex>
                <NotificationFeed
                  // @ts-ignore
                  buttonRef={notifRef}
                  renderItem={({ item, ...props }: any) => {
                    const { vendorDomain, vendorName } = item.data;
                    return (
                      <NotificationCell
                        {...props}
                        item={item}
                        // You can use any properties available on the `actor` for the name and avatar
                        // avatar={
                        //   vendorDomain && vendorName ? (
                        //     <Avatar
                        //       src={getFaviconSrc(vendorDomain)}
                        //       alt={vendorName}
                        //       sx={{ maxWidth: "45px", maxHeight: "45px" }}
                        //     />
                        //   ) : (
                        //     <></>
                        //   )
                        // }
                      />
                    );
                  }}
                />

                <SendNotificationForm
                  userId={userId as unknown as string}
                  tenant={tenant}
                />
                <NotificationToasts />

                <Flex
                  mt={6}
                  borderTopWidth={1}
                  borderTopColor="gray.100"
                  py={2}
                >
                  <Link
                    href="https://github.com/knocklabs/in-app-notifications-example-nextjs"
                    fontSize={14}
                    color="gray.600"
                    mr={3}
                  >
                    <Icon as={IoLogoGithub} mr={1} />
                    Github repo
                  </Link>

                  <Link
                    href="https://docs.knock.app/in-app-ui/react/overview"
                    fontSize={14}
                    color="gray.600"
                  >
                    <Icon as={IoDocument} mr={1} />
                    Documentation
                  </Link>

                  <Link
                    href="https://knock.app"
                    fontSize={14}
                    color="gray.600"
                    ml="auto"
                  >
                    Powered by Knock
                  </Link>
                </Flex>
              </Box>
            </NotificationFeedContainer>
          </KnockFeedProvider>
        </KnockProvider>
      ) : null}
    </>
  );
}
