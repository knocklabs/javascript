import { ChannelData } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import React, { createContext, useCallback, useContext } from "react";

export interface Device {
  token: string;
  locale?: string;
  timezone?: string;
}

export interface KnockPushNotificationContextType {
  registerPushTokenToChannel(
    token: string,
    channelId: string,
  ): Promise<ChannelData | void>;
  unregisterPushTokenFromChannel(
    token: string,
    channelId: string,
  ): Promise<ChannelData | void>;
}

const KnockPushNotificationContext = createContext<
  KnockPushNotificationContextType | undefined
>(undefined);

export interface KnockPushNotificationProviderProps {
  children?: React.ReactElement;
}

export const KnockPushNotificationProvider: React.FC<
  KnockPushNotificationProviderProps
> = ({ children }) => {
  const knockClient = useKnockClient();

  const registerNewDeviceDataOnServer = useCallback(
    async (devices: Device[], channelId: string): Promise<ChannelData> => {
      return knockClient.user.setChannelData({
        channelId: channelId,
        channelData: { devices: devices },
      });
    },
    [knockClient],
  );

  const registerPushTokenToChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const newDevice: Device = {
        token,
        locale,
        timezone,
      };

      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const devices: Device[] = result.data["devices"] || [];
          const existingDeviceIndex = devices.findIndex(
            (device) => device.token === token,
          );

          if (existingDeviceIndex === -1) {
            devices.push(newDevice);
          } else {
            devices[existingDeviceIndex] = newDevice;
          }
          knockClient.log("[Knock] registerPushTokenToChannel success");
          return registerNewDeviceDataOnServer(devices, channelId);
        })
        .catch((_) => {
          // No data registered on that channel for that user, we'll create a new record
          return registerNewDeviceDataOnServer([newDevice], channelId);
        });
    },
    [knockClient, registerNewDeviceDataOnServer],
  );

  const unregisterPushTokenFromChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const devices: Device[] = result.data["devices"] || [];
          const updatedDevices = devices.filter(
            (device) => device.token !== token,
          );
          knockClient.log("unregisterPushTokenFromChannel success");
          return registerNewDeviceDataOnServer(updatedDevices, channelId);
        })
        .catch((error) => {
          console.error(
            `[Knock] Error unregistering push token from channel:`,
            error,
          );
        });
    },
    [knockClient, registerNewDeviceDataOnServer],
  );

  return (
    <KnockPushNotificationContext.Provider
      value={{ registerPushTokenToChannel, unregisterPushTokenFromChannel }}
    >
      {children}
    </KnockPushNotificationContext.Provider>
  );
};

export const usePushNotifications = (): KnockPushNotificationContextType => {
  const context = useContext(KnockPushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "[Knock] usePushNotifications must be used within a KnockPushNotificationProvider",
    );
  }
  return context;
};
