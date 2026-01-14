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

  const setChannelData = useCallback(
    async (devices: Device[], channelId: string): Promise<ChannelData> => {
      return knockClient.user.setChannelData({
        channelId: channelId,
        channelData: { devices: devices },
      });
    },
    [knockClient],
  );

  // Acts like an upsert. Inserts or updates
  const registerPushTokenToChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      if (!knockClient.isAuthenticated()) {
        knockClient.log(
          "[Knock] Skipping registerPushTokenToChannel - user not authenticated",
        );
        return;
      }

      const newDevice: Device = {
        token,
        locale: Intl.DateTimeFormat().resolvedOptions().locale,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const devices: Device[] = result.data["devices"] || [];

          const existingDeviceIndex = devices.findIndex(
            (device) => device.token === token,
          );

          // add device to devices array
          if (existingDeviceIndex === -1) {
            devices.push(newDevice);
          }
          // update device case
          else {
            devices[existingDeviceIndex] = newDevice;
          }
          knockClient.log("[Knock] registerPushTokenToChannel success");
          return setChannelData(devices, channelId);
        })
        .catch((_) => {
          // no existing devices case
          return setChannelData([newDevice], channelId);
        });
    },
    [knockClient, setChannelData],
  );

  const unregisterPushTokenFromChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      if (!knockClient.isAuthenticated()) {
        knockClient.log(
          "[Knock] Skipping unregisterPushTokenFromChannel - user not authenticated",
        );
        return;
      }

      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const devices: Device[] = result.data["devices"] || [];

          const updatedDevices = devices.filter(
            (device) => device.token !== token,
          );
          knockClient.log("unregisterPushTokenFromChannel success");
          return setChannelData(updatedDevices, channelId);
        })
        .catch((error) => {
          console.error(
            `[Knock] Error deregistering device from channel:`,
            error,
          );
        });
    },
    [knockClient, setChannelData],
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
