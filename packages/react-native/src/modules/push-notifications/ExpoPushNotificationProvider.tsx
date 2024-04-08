// PushNotificationContext.tsx
import {
  ChannelData,
  Message,
  MessageEngagementStatus,
} from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface ExpoPushNotificationContextType {
  expoPushToken: string | null;
  registerForPushNotifications: () => Promise<void>;
  onNotificationReceived: (
    handler: (notification: Notifications.Notification) => void,
  ) => void;
  onNotificationTapped: (
    handler: (response: Notifications.NotificationResponse) => void,
  ) => void;
}

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const ExpoPushNotificationContext = createContext<
  ExpoPushNotificationContextType | undefined
>(undefined);

export interface ExpoPushNotificationProviderProps {
  knockExpoChannelId: string;
  children?: React.ReactElement;
}

async function requestPermissionAndGetPushToken(): Promise<Notifications.ExpoPushToken | null> {
  // Check for device support
  if (!Device.isDevice) {
    console.log("Must use physical device for Push Notifications");
    return null;
  }

  // Check for permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log(
      "Failed to get push token for push notification! User has not granted push notification permissions on device.",
    );
    return null;
  }

  try {
    if (
      !Constants.expoConfig ||
      !Constants.expoConfig.extra ||
      !Constants.expoConfig.extra.eas
    ) {
      console.error("Project ID is not defined in the app configuration.");
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    return token;
  } catch (error) {
    console.error("Error getting a push token", error);
    return null;
  }
}

export const ExpoPushNotificationProvider: React.FC<
  ExpoPushNotificationProviderProps
> = ({ knockExpoChannelId, children }) => {
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

  async function registerForPushNotifications(): Promise<void> {
    requestPermissionAndGetPushToken().then((token) => {
      if (token?.data) {
        setExpoPushToken(token.data);
      }
    });
  }

  async function updateKnockMessageStatusFromNotification(
    notification: Notifications.Notification,
    status: MessageEngagementStatus,
  ) {
    const messageId = notification.request.content.data["knock_message_id"];
    knockClient.messages
      .updateStatus(messageId, status)
      .then((result: Message) => {
        console.log("updateKnockMessageStatus success", result);
      })
      .catch((error: any) => {
        console.error("updateKnockMessageStatus failed", error);
      });
  }

  async function registerNewTokenDataOnServer(
    tokens: string[],
    channelId: string,
  ): Promise<ChannelData> {
    return knockClient.user.setChannelData({
      channelId: channelId,
      channelData: { tokens: tokens },
    });
  }

  async function registerPushTokenToChannel(
    token: string,
    channelId: string,
  ): Promise<void> {
    knockClient.user
      .getChannelData({ channelId: channelId })
      .then((result: ChannelData) => {
        console.log("setDeviceTokenToChannel success", result);
        const tokens: string[] = result.data["tokens"];
        if (!tokens.includes(token)) {
          tokens.push(token);
          return registerNewTokenDataOnServer(tokens, channelId);
        }
      })
      .catch(() => {
        // No data registered on that channel for that user, we'll create a new record
        return registerNewTokenDataOnServer([token], channelId);
      });
  }

  useEffect(() => {
    registerForPushNotifications()
      .then(() => {
        if (expoPushToken) {
          registerPushTokenToChannel(expoPushToken, knockExpoChannelId)
            .then((result) => {
              console.log("setChannelData success");
            })
            .catch((error: any) => {
              console.error(
                "Error in setting push token or channel data",
                error,
              );
            });
        }
      })
      .catch((error: any) => {
        console.error("Error in setting push token or channel data", error);
      });

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(
          "Expo Push Notification received in foreground:",
          notification,
        );
        updateKnockMessageStatusFromNotification(notification, "interacted");
        notificationReceivedHandler(notification);
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Expo Push Notification was interacted with:", response);
        updateKnockMessageStatusFromNotification(
          response.notification,
          "interacted",
        );
        notificationTappedHandler(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationReceivedSubscription,
      );
      Notifications.removeNotificationSubscription(
        notificationResponseSubscription,
      );
    };
  }, [notificationReceivedHandler, notificationTappedHandler]);

  return (
    <ExpoPushNotificationContext.Provider
      value={{
        expoPushToken,
        registerForPushNotifications,
        onNotificationReceived,
        onNotificationTapped,
      }}
    >
      {children}
    </ExpoPushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): ExpoPushNotificationContextType => {
  const context = useContext(ExpoPushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "usePushNotifications must be used within a PushNotificationProvider",
    );
  }
  return context;
};
