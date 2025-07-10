import {
  KnockExpoPushNotificationProvider,
  KnockFeedProvider,
  KnockProvider,
  NotificationIconButton,
} from "@knocklabs/expo";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import NotificationFeedContainer from "@/components/NotificationFeedContainer";

export default function HomeScreen() {
  const [isNotificationFeedOpen, setIsNotificationFeedOpen] = useState(false);

  const onTopActionButtonTap = useCallback(() => {
    setIsNotificationFeedOpen(!isNotificationFeedOpen);
  }, [isNotificationFeedOpen]);

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
            {!isNotificationFeedOpen && (
              <NotificationIconButton
                onClick={onTopActionButtonTap}
                badgeCountType={"unread"}
              />
            )}
            {isNotificationFeedOpen && (
              <NotificationFeedContainer
                handleClose={() =>
                  setIsNotificationFeedOpen(!isNotificationFeedOpen)
                }
              />
            )}
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
