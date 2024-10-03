import {
  InAppMessage,
  InAppMessagesClient,
  InAppMessagesClientOptions,
  NetworkStatus,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { useInAppMessageChannel } from "../context";

export interface UseInAppMessagesOptions extends InAppMessagesClientOptions {}

export interface UseInAppMessagesResponse<TContent, TData> {
  messages: InAppMessage<TContent, TData>[];
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessages = <TContent = GenericData, TData = GenericData>(
  messageType: string,
  options: UseInAppMessagesOptions = {},
): UseInAppMessagesResponse<TContent, TData> => {
  const { inAppChannelClient } = useInAppMessageChannel();

  const inAppMessagesClient = useMemo(() => {
    // TODO: Ensure this is stable and doesn't recreate the message client
    // XXX: Pretty sure this does create a new client instance at each render.
    return new InAppMessagesClient(inAppChannelClient, messageType, options);
  }, [inAppChannelClient, messageType, options]);

  // TODO: Create selectors as functions in the client library though
  const messages = useStore(inAppChannelClient.store, (state) => {
    // console.log("messages")
    const messageIds = new Set(
      state.queries[inAppMessagesClient.queryKey]?.data?.entries?.map(
        (message) => message.id,
      ),
    );

    // TODO: Just grab based on the message id instead of looping over all messages
    const messages = Object.entries(state.messages).reduce<
      InAppMessage<TContent, TData>[]
    >((messages, [id, message]) => {
      if (messageIds.has(id)) {
        messages.push(message as InAppMessage<TContent, TData>);
      }
      return messages;
    }, []);

    return messages;
  });

  // TODO: Consolidate to a single useStore call to get all message info
  const { networkStatus, loading } = useStore(
    inAppChannelClient.store,
    (state) => {
      const query = state.queries[inAppMessagesClient.queryKey];
      return {
        networkStatus: query?.networkStatus ?? NetworkStatus.ready,
        loading: query?.loading ?? false,
      };
    },
  );

  useEffect(() => {
    inAppMessagesClient.fetch();
    inAppMessagesClient.subscribe();

    return () => {
      inAppMessagesClient.unsubscribe()
    }
  }, []);

  return { messages, networkStatus, loading };
};

export type UseInAppMessageOptions = Omit<UseInAppMessagesOptions, "page_size">;

export interface UseInAppMessageResponse<TContent, TData> {
  message?: InAppMessage<TContent, TData>;
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessage = <TContent = GenericData, TData = GenericData>(
  messageType: string,
  options: UseInAppMessageOptions = {},
): UseInAppMessageResponse<TContent, TData> => {
  const { messages, ...info } = useInAppMessages<TContent, TData>(messageType, {
    ...options,
    page_size: 1,
  });

  return { message: messages[0], ...info };
};
