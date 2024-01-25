import {
  NotificationFeedContainer,
  useKnockFeed,
} from "@knocklabs/react-native";
import { useEffect } from "react";
import { Button, ScrollView, Text, View } from "react-native";

export default function NotificationFeed() {
  const { feedClient, useFeedStore } = useKnockFeed();
  const { loading, items, pageInfo } = useFeedStore((state) => state);

  useEffect(() => {
    const teardown = feedClient.listenForUpdates();

    feedClient.on("messages.new", (data) => {
      console.log(data);
    });

    feedClient.on("items.received.*", (data) => {
      console.log(data);
    });

    return () => teardown();
  }, [feedClient]);

  return (
    <NotificationFeedContainer>
      <ScrollView>
        <Text style={{ fontSize: 19, fontWeight: 600 }}>
          In-App Feed Notification Example
        </Text>

        {loading && <Text>Loading…</Text>}

        {items.length === 0 ? (
          <View>
            <Text>No notifications found</Text>
          </View>
        ) : (
          <View>
            {items.map((item) => (
              <View key={item.id} style={{ marginTop: 16 }}>
                <Text>ID: {item.id}</Text>
                <Text>Actor ID: {item.actors?.[0]?.id}</Text>
                <Text>Actor email: {item.actors?.[0]?.email}</Text>
                <Text>Inserted: {item.inserted_at}</Text>
                <Text>Read at: {item.read_at}</Text>
                <View style={{ marginBottom: 24 }}></View>
              </View>
            ))}
          </View>
        )}

        <Button
          title="Load more items"
          disabled={!pageInfo.after || loading}
          onClick={() => feedClient.fetchNextPage()}
        />
      </ScrollView>
    </NotificationFeedContainer>
  );
}
