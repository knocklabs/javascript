import { KnockExpoPushNotificationProvider } from "@knocklabs/expo";
import {
  KnockFeedProvider,
  KnockProvider,
  NotificationIconButton,
} from "@knocklabs/react-native";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";

import NotificationFeedContainer from "./NotificationFeedContainer";

const App: React.FC = () => {
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
            <StatusBar style="auto" />
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
};

export default App;

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
