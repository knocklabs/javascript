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

export interface KnockExpoPushNotificationContextType {
  expoPushToken: string | null;
  registerForPushNotifications: () => Promise<void>;
  registerPushTokenToChannel(token: string, channelId: string): Promise<void>;
  unregisterPushTokenFromChannel(
    token: string,
    channelId: string,
  ): Promise<void>;
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

const defaultNotificationHandler = async (
  notification: Notifications.Notification,
): Promise<Notifications.NotificationBehavior> => {
  // Your default logic here
  return {
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  };
};

const KnockExpoPushNotificationContext = createContext<
  KnockExpoPushNotificationContextType | undefined
>(undefined);

export interface KnockExpoPushNotificationProviderProps {
  knockExpoChannelId: string;
  customNotificationHandler?: (
    notification: Notifications.Notification,
  ) => Promise<Notifications.NotificationBehavior>;
  children?: React.ReactElement;
}

async function requestPushPermissionIfNeeded(): Promise<string> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus;
}

async function getExpoPushToken(): Promise<Notifications.ExpoPushToken | null> {
  try {
    if (
      !Constants.expoConfig ||
      !Constants.expoConfig.extra ||
      !Constants.expoConfig.extra.eas
    ) {
      console.error("Expo Project ID is not defined in the app configuration.");
      return null;
    }
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    return token;
  } catch (error) {
    return null;
  }
}

async function requestPermissionAndGetPushToken(): Promise<Notifications.ExpoPushToken | null> {
  // Check for device support
  if (!Device.isDevice) {
    console.warn("Must use physical device for Push Notifications");
    return null;
  }

  const permissionStatus = await requestPushPermissionIfNeeded();

  if (permissionStatus !== "granted") {
    return null;
  }

  return getExpoPushToken();
}

export const KnockExpoPushNotificationProvider: React.FC<
  KnockExpoPushNotificationProviderProps
> = ({ knockExpoChannelId, customNotificationHandler, children }) => {
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
        knockClient.log("updateKnockMessageStatus success");
      })
      .catch((error: any) => {
        knockClient.log("updateKnockMessageStatus failed");
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
        const tokens: string[] = result.data["tokens"];
        if (!tokens.includes(token)) {
          tokens.push(token);
          return registerNewTokenDataOnServer(tokens, channelId);
        }
        knockClient.log("registerPushTokenToChannel success");
      })
      .catch(() => {
        // No data registered on that channel for that user, we'll create a new record
        return registerNewTokenDataOnServer([token], channelId);
      });
  }

  async function unregisterPushTokenFromChannel(
    token: string,
    channelId: string,
  ): Promise<void> {
    knockClient.user
      .getChannelData({ channelId: channelId })
      .then((result: ChannelData) => {
        const tokens: string[] = result.data["tokens"];
        const updatedTokens = tokens.filter(
          (channelToken) => channelToken !== token,
        );
        knockClient.log("unregisterPushTokenFromChannel success");
        return registerNewTokenDataOnServer(updatedTokens, channelId);
      });
  }

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification:
        customNotificationHandler ?? defaultNotificationHandler,
    });

    registerForPushNotifications()
      .then(() => {
        if (expoPushToken) {
          registerPushTokenToChannel(expoPushToken, knockExpoChannelId)
            .then((result) => {
              knockClient.log("setChannelData success");
            })
            .catch((error: any) => {
              knockClient.log("Error in setting push token or channel data");
            });
        }
      })
      .catch((error: any) => {
        knockClient.log("Error in setting push token or channel data");
      });

    const notificationReceivedSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        knockClient.log("Expo Push Notification received in foreground:");
        updateKnockMessageStatusFromNotification(notification, "interacted");
        notificationReceivedHandler(notification);
      });

    const notificationResponseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        knockClient.log("Expo Push Notification was interacted with");
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
  }, [
    notificationReceivedHandler,
    notificationTappedHandler,
    customNotificationHandler,
  ]);

  return (
    <KnockExpoPushNotificationContext.Provider
      value={{
        expoPushToken,
        registerForPushNotifications,
        registerPushTokenToChannel,
        unregisterPushTokenFromChannel,
        onNotificationReceived,
        onNotificationTapped,
      }}
    >
      {children}
    </KnockExpoPushNotificationContext.Provider>
  );
};

export const useExpoPushNotifications =
  (): KnockExpoPushNotificationContextType => {
    const context = useContext(KnockExpoPushNotificationContext);
    if (context === undefined) {
      throw new Error(
        "useExpoPushNotifications must be used within a PushNotificationProvider",
      );
    }
    return context;
  };
