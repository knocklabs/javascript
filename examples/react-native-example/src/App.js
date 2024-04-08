import {
  ExpoPushNotificationProvider,
  KnockFeedProvider,
  KnockProvider,
} from "@knocklabs/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

import NotificationFeed from "./components/NotificationFeed";

export default function App() {
  return (
    <KnockProvider
      apiKey={process.env.EXPO_PUBLIC_KNOCK_PUBLIC_API_KEY}
      host={process.env.EXPO_PUBLIC_KNOCK_HOST}
      userId={process.env.EXPO_PUBLIC_KNOCK_USER_ID}
    >
      <ExpoPushNotificationProvider
        knockExpoChannelId={process.env.EXPO_PUBLIC_KNOCK_PUSH_CHANNEL_ID}
      >
        <KnockFeedProvider
          feedId={process.env.EXPO_PUBLIC_KNOCK_FEED_CHANNEL_ID}
        >
          <View style={styles.container}>
            <StatusBar style="auto" />
            <NotificationFeed />
          </View>
        </KnockFeedProvider>
      </ExpoPushNotificationProvider>
    </KnockProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: 8,
  },
});
