import {
  InAppMessage,
  InAppMessageClient,
  InAppMessageClientOptions,
  NetworkStatus,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { useInAppMessageChannel } from "../context";

export type UseInAppMessagesOptions = InAppMessageClientOptions;

export interface InAppMessagesResponse<TContent, TData> {
  messages: InAppMessage<TContent, TData>[];
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessages = <TContent = GenericData, TData = GenericData>(
  messageType: string,
  options: UseInAppMessagesOptions = {},
): InAppMessagesResponse<TContent, TData> => {
  const { inAppChannelClient } = useInAppMessageChannel();

  const inAppMessageClient = useMemo(() => {
    return new InAppMessageClient(inAppChannelClient, messageType, options);
  }, [inAppChannelClient, messageType, options]);

  // TODO: Is it possible to extract all store usage?
  // Maybe not because framework specific hooks need to be a called to support reactivity
  // Could definitely create selectors as functions in the client library though
  const messages = useStore(inAppChannelClient.store, (state) => {
    const messageIds = new Set(
      state.queries[inAppMessageClient.queryKey]?.data?.items?.map(
        (message) => message.id,
      ),
    );

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

  const { networkStatus, loading } = useStore(
    inAppChannelClient.store,
    (state) => {
      const query = state.queries[inAppMessageClient.queryKey];
      return {
        networkStatus: query?.networkStatus ?? NetworkStatus.ready,
        loading: query?.loading ?? false,
      };
    },
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      inAppMessageClient.fetch();
    }, 2500);

    return () => {
      clearTimeout(intervalId);
    };
  }, [inAppMessageClient]);

  return { messages, networkStatus, loading };
};

export type UseInAppMessageOptions = Omit<UseInAppMessagesOptions, "page_size">;

export interface InAppMessageResponse<TContent, TData> {
  message?: InAppMessage<TContent, TData>;
  networkStatus: NetworkStatus;
  loading: boolean;
}

export const useInAppMessage = <TContent = GenericData, TData = GenericData>(
  messageType: string,
  options: UseInAppMessageOptions = {},
): InAppMessageResponse<TContent, TData> => {
  const { messages, ...info } = useInAppMessages<TContent, TData>(messageType, {
    ...options,
    page_size: 1,
  });

  return { message: messages[0], ...info };
};
