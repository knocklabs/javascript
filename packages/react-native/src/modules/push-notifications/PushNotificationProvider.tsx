// PushNotificationContext.tsx
import { useKnockClient } from "@knocklabs/react-core";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationContextType {
  expoPushToken: string | null;
  registerForPushNotificationsAsync: () => Promise<void>;
  sendPushNotification: (expoPushToken: string) => Promise<void>;
  onNotificationReceived: (
    handler: (notification: Notifications.Notification) => void,
  ) => void;
  onNotificationTapped: (
    handler: (response: Notifications.NotificationResponse) => void,
  ) => void;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

export interface PushNotificationProviderProps {
  children?: React.ReactElement;
}

export const PushNotificationProvider: React.FC<
  PushNotificationProviderProps
> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const knockClient = useKnockClient();
  const [notificationReceivedHandler, setNotificationReceivedHandler] =
    useState<(notification: Notifications.Notification) => void>(
      () => () => {},
    );
  const [notificationTappedHandler, setNotificationTappedHandler] = useState<
    (response: Notifications.NotificationResponse) => void
  >(() => () => {});

  // Custom handler setters
  const onNotificationReceived = (
    handler: (notification: Notifications.Notification) => void,
  ) => {
    setNotificationReceivedHandler(() => handler);
  };

  const onNotificationTapped = (
    handler: (response: Notifications.NotificationResponse) => void,
  ) => {
    setNotificationTappedHandler(() => handler);
  };

  async function registerForPushNotificationsAsync(): Promise<void> {
    // Check for device support
    if (!Device.isDevice) {
      alert("Must use physical device for Push Notifications");
      return;
    }

    // Check for permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }

    try {
      if (
        !Constants.expoConfig ||
        !Constants.expoConfig.extra ||
        !Constants.expoConfig.extra.eas
      ) {
        console.error("Project ID is not defined in the app configuration.");
        return;
      }
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
      if (token.data) {
        setExpoPushToken(token.data);
      }
    } catch (error) {
      console.error("Error getting a push token", error);
    }
  }

  async function sendPushNotification(): Promise<void> {
    const message = {
      to: expoPushToken,
      sound: "default",
      title: "Original Title",
      body: "And here is the body!",
      data: { someData: "goes here" },
    };

    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });
  }

  const handleNotificationReceived = (
    notification: Notifications.Notification,
  ) => {
    console.log("Notification received in foreground:", notification);
    const messageId = notification.request.content.data["knock_message_id"];

    if (typeof messageId === "string") {
      knockClient.messages
        .updateMessageStatus(messageId, "seen")
        .then((result) => {
          console.log("updateMessageStatus success", result);
        })
        .catch((error) => {
          console.error("Failed to update message status", error);
        });
    } else {
      console.error("Message ID is not a string", messageId);
    }
  };

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse,
  ) => {
    console.log("Notification was interacted with:", response);
    const messageId =
      response.notification.request.content.data["knock_message_id"];

    if (typeof messageId === "string") {
      knockClient.messages
        .updateMessageStatus(messageId, "interacted")
        .then((result) => {
          console.log("updateMessageStatus success", result);
        })
        .catch((error) => {
          console.error("Failed to update message status", error);
        });
    } else {
      console.error("Message ID is not a string", messageId);
    }
  };

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(() => {
        if (expoPushToken) {
          return knockClient.user.setChannelData({
            channelId: process.env.EXPO_PUBLIC_KNOCK_PUSH_CHANNEL_ID!,
            channelData: { tokens: [expoPushToken] },
          });
        }
      })
      .then((result) => {
        console.log("setChannelData success", result);
      })
      .catch((error: any) => {
        console.error("Error in setting push token or channel data", error);
      });

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener(handleNotificationReceived);
    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse,
      );

    return () => {
      Notifications.removeNotificationSubscription(
        notificationReceivedSubscription,
      );
      Notifications.removeNotificationSubscription(
        notificationResponseSubscription,
      );
    };
  }, []);

  return (
    <PushNotificationContext.Provider
      value={{
        expoPushToken,
        registerForPushNotificationsAsync,
        sendPushNotification,
        onNotificationReceived,
        onNotificationTapped,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): PushNotificationContextType => {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "usePushNotifications must be used within a PushNotificationProvider",
    );
  }
  return context;
};
