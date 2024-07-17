import { FeedItem } from "@knocklabs/client";
import {
  NotificationFeedCell,
  NotificationFeedContainer,
  useKnockFeed,
} from "@knocklabs/react-native";
import { useEffect } from "react";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function NotificationFeed() {
  const { feedClient, useFeedStore } = useKnockFeed();
  const { loading, items, pageInfo } = useFeedStore((state) => state);

  const buttonTapAction = (data) => {
    console.log(data);
  };

  const rowTapAction = (feedItem: FeedItem) => {
    console.log(feedItem);
  };

  useEffect(() => {
    feedClient.fetch();
    const teardown = feedClient.listenForUpdates?.();

    const handleNewMessage = (data) => {
      console.log(data);
    };

    const handleItemsReceived = (data) => {
      console.log(data);
    };

    feedClient.on("messages.new", handleNewMessage);
    feedClient.on("items.received.*", handleItemsReceived);

    return () => {
      // Unsubscribe from events
      feedClient.off("messages.new", handleNewMessage);
      feedClient.off("items.received.*", handleItemsReceived);

      // Call teardown if it is a function
      if (typeof teardown === "function") {
        teardown;
      }
    };
  }, [feedClient]);

  return (
    <View style={styles.container}>
      <NotificationFeedContainer>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {loading && <Text>Loading…</Text>}

          {items.length === 0 ? (
            <View style={styles.noNotifications}>
              <Text>No notifications found</Text>
            </View>
          ) : (
            <View style={styles.notifications}>
              {items.map((item) => (
                <NotificationFeedCell
                  key={item.id}
                  item={item}
                  buttonTapAction={buttonTapAction}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </NotificationFeedContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  noNotifications: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  notifications: {
    width: "100%",
  },
});
