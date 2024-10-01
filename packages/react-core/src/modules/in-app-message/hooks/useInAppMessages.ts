import {
  InAppMessage,
  InAppMessagesClient,
  InAppMessagesClientOptions,
  NetworkStatus,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { useInAppChannel } from "../context";

export interface UseInAppMessagesOptions extends InAppMessagesClientOptions {}

export interface UseInAppMessagesResponse<
  TContent extends GenericData,
  TData extends GenericData,
> {
  messages: InAppMessage<TContent, TData>[];
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessages = <
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
>(
  messageType: string,
  options: UseInAppMessagesOptions = {},
): UseInAppMessagesResponse<TContent, TData> => {
  const { inAppChannelClient } = useInAppChannel();

  const inAppMessagesClient = useMemo(() => {
    // TODO: Ensure this is stable and doesn't recreate the message client
    return new InAppMessagesClient(inAppChannelClient, messageType, options);
  }, [inAppChannelClient, messageType, options]);

  // TODO: Create selectors as functions in the client library though
  const { messages, networkStatus, loading } = useStore(
    inAppChannelClient.store,
    (state) => {
      const queryInfo = state.queries[inAppMessagesClient.queryKey];
      const messageIds = queryInfo?.data?.messageIds ?? [];

      const messages = messageIds.reduce<InAppMessage<TContent, TData>[]>(
        (messages, messageId) => {
          const message = state.messages[messageId];
          if (message) {
            messages.push(message as InAppMessage<TContent, TData>);
          }
          return messages;
        },
        [],
      );

      return {
        messages,
        networkStatus: queryInfo?.networkStatus ?? NetworkStatus.ready,
        loading: queryInfo?.loading ?? false,
      };
    },
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      inAppMessagesClient.fetch();
    }, 2500);

    return () => {
      clearTimeout(intervalId);
    };
  }, [inAppMessagesClient]);

  return { messages, networkStatus, loading };
};

export type UseInAppMessageOptions = Omit<UseInAppMessagesOptions, "page_size">;

export interface UseInAppMessageResponse<
  TContent extends GenericData,
  TData extends GenericData,
> extends GenericData {
  message?: InAppMessage<TContent, TData>;
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessage = <
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
>(
  messageType: string,
  options: UseInAppMessageOptions = {},
): UseInAppMessageResponse<TContent, TData> => {
  const { messages, ...info } = useInAppMessages<TContent, TData>(messageType, {
    ...options,
    page_size: 1,
  });

  return { message: messages[0], ...info };
};
