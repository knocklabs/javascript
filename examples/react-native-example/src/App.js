import {
  KnockExpoPushNotificationProvider,
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
} from "@knocklabs/react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";

export default function App() {
  return (
    <KnockProvider
      apiKey={process.env.EXPO_PUBLIC_KNOCK_PUBLIC_API_KEY}
      host={process.env.EXPO_PUBLIC_KNOCK_HOST}
      userId={process.env.EXPO_PUBLIC_KNOCK_USER_ID}
      logLevel="debug"
    >
      <KnockExpoPushNotificationProvider
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
      </KnockExpoPushNotificationProvider>
    </KnockProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    paddingHorizontal: 0,
  },
});
