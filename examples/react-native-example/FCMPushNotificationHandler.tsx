import { usePushNotifications } from "@knocklabs/react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";
import { PermissionsAndroid } from "react-native";
import Config from "react-native-config";

/**
 * An example of how to handle push notifications using Knock and Firebase Cloud Messaging via react-native-firebase.
 */
const FCMPushNotificationHandler = () => {
  const pushToken = useFCMPushToken();
  const { registerPushTokenToChannel } = usePushNotifications();

  useEffect(() => {
    // For Android, see https://rnfirebase.io/messaging/usage#android---requesting-permissions
    // For iOS, see https://rnfirebase.io/messaging/usage#ios---requesting-permissions
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    ).catch(console.error);
  }, []);

  useEffect(() => {
    if (pushToken) {
      // Register the push token with the FCM channel in Knock
      registerPushTokenToChannel(pushToken, Config.KNOCK_FCM_CHANNEL_ID!).catch(
        console.error,
      );
    }
  }, [pushToken, registerPushTokenToChannel]);

  // See https://rnfirebase.io/messaging/notifications#handling-interaction
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log("App opened via notification from quit state");
        }
      })
      .catch(console.error);

    const unsubscribe = messaging().onNotificationOpenedApp(() => {
      console.log("App opened via notification while in the background");
    });

    return unsubscribe;
  }, []);

  return null;
};

function useFCMPushToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    messaging()
      .getToken()
      .then((token) => {
        console.log(`Received push token: ${token}`);
        setToken(token);
      })
      .catch(console.error);

    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log(`Push token refreshed: ${token}`);
      setToken(token);
    });

    return unsubscribe;
  }, []);

  return token;
}

export default FCMPushNotificationHandler;
