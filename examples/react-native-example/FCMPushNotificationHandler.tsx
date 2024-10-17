import { usePushNotifications } from "@knocklabs/react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect } from "react";
import { PermissionsAndroid } from "react-native";
import Config from "react-native-config";

const FCMPushNotificationHandler = () => {
  const { registerPushTokenToChannel } = usePushNotifications();

  useEffect(() => {
    if (!Config.KNOCK_FCM_CHANNEL_ID) {
      console.log("FCM push notifications are not enabled");
      return;
    }

    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ).catch(console.error);

    messaging()
      .getToken()
      .then((token) => {
        console.log(`Received push token: ${token}`);
        registerPushTokenToChannel(token, Config.KNOCK_FCM_CHANNEL_ID!).catch(
          console.error,
        );
      })
      .catch(console.error);
  }, [registerPushTokenToChannel]);

  useEffect(() => {
    // See https://rnfirebase.io/messaging/notifications#handling-interaction

    messaging()
      .getInitialNotification()
      .then(() => {
        console.log("App opened via notification from quit state");
      })
      .catch(console.error);

    messaging().onNotificationOpenedApp(() => {
      console.log("App opened via notification while in the background");
    });
  }, []);

  useEffect(() => {
    messaging().onTokenRefresh((token) => {
      console.log(`Push token refreshed: ${token}`);
      registerPushTokenToChannel(token, Config.KNOCK_FCM_CHANNEL_ID!).catch(
        console.error,
      );
    });
  }, [registerPushTokenToChannel]);

  return null;
};

export default FCMPushNotificationHandler;
