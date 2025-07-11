import { ChannelData } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import React, { createContext, useCallback, useContext } from "react";

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

  const registerNewTokenDataOnServer = useCallback(
    async (tokens: string[], channelId: string): Promise<ChannelData> => {
      return knockClient.user.setChannelData({
        channelId: channelId,
        channelData: { tokens: tokens },
      });
    },
    [knockClient],
  );

  const registerPushTokenToChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const tokens: string[] = result.data["tokens"];
          if (!tokens.includes(token)) {
            tokens.push(token);
            return registerNewTokenDataOnServer(tokens, channelId);
          }
          knockClient.log("[Knock] registerPushTokenToChannel success");
        })
        .catch((_) => {
          // No data registered on that channel for that user, we'll create a new record
          return registerNewTokenDataOnServer([token], channelId);
        });
    },
    [knockClient, registerNewTokenDataOnServer],
  );

  const unregisterPushTokenFromChannel = useCallback(
    async (token: string, channelId: string): Promise<ChannelData | void> => {
      return knockClient.user
        .getChannelData({ channelId: channelId })
        .then((result: ChannelData) => {
          const tokens: string[] = result.data["tokens"];
          const updatedTokens = tokens.filter(
            (channelToken) => channelToken !== token,
          );
          knockClient.log("unregisterPushTokenFromChannel success");
          return registerNewTokenDataOnServer(updatedTokens, channelId);
        })
        .catch((error) => {
          console.error(
            `[Knock] Error unregistering push token from channel:`,
            error,
          );
        });
    },
    [knockClient, registerNewTokenDataOnServer],
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
