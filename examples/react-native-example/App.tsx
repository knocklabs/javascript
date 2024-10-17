import {
  KnockFeedProvider,
  KnockProvider,
  KnockPushNotificationProvider,
  NotificationIconButton,
} from "@knocklabs/react-native";
import React, { useCallback, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text } from "react-native";
import Config from "react-native-config";
import "react-native-svg";

import NotificationFeedContainer from "./NotificationFeedContainer";
import PushHandler from "./PushHandler";

function App(): React.JSX.Element {
  const [isNotificationFeedOpen, setIsNotificationFeedOpen] = useState(false);
  const onTopActionButtonTap = useCallback(() => {
    setIsNotificationFeedOpen(!isNotificationFeedOpen);
  }, [isNotificationFeedOpen]);

  return (
    <KnockProvider
      apiKey={Config.KNOCK_PUBLIC_API_KEY}
      host={Config.KNOCK_HOST}
      userId={Config.KNOCK_USER_ID}
      logLevel="debug"
    >
      <KnockFeedProvider feedId={Config.KNOCK_FEED_CHANNEL_ID}>
        <KnockPushNotificationProvider>
          <>
            <PushHandler />
            <SafeAreaView style={styles.container}>
              <StatusBar barStyle="light-content" />
              {!isNotificationFeedOpen && (
                <>
                  <Text style={styles.heading}>Knock React Native Example</Text>
                  <NotificationIconButton
                    onClick={onTopActionButtonTap}
                    badgeCountType={"unread"}
                  />
                </>
              )}
              {isNotificationFeedOpen && (
                <NotificationFeedContainer
                  handleClose={() =>
                    setIsNotificationFeedOpen(!isNotificationFeedOpen)
                  }
                />
              )}
            </SafeAreaView>
          </>
        </KnockPushNotificationProvider>
      </KnockFeedProvider>
    </KnockProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e8ec",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "#1c2024",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default App;
