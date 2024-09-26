import {
  FetchInAppMessagesOptions,
  InAppMessage,
  InAppMessageClient,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { useInAppMessageChannel } from "../context";

// TODO: Type so that the message content (or fields) is typed
export const useInAppMessages = (
  messageType: string,
  options: FetchInAppMessagesOptions = {},
) => {
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

    const messages = Object.entries(state.messages).reduce<InAppMessage[]>(
      (messages, [id, message]) => {
        if (messageIds.has(id)) {
          messages.push(message);
        }
        return messages;
      },
      [],
    );

    return messages;
  });

  const { networkStatus, loading } = useStore(
    inAppChannelClient.store,
    (state) => {
      const query = state.queries[inAppMessageClient.queryKey];
      return { networkStatus: query?.networkStatus, loading: query?.loading };
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

export const useInAppMessage = (
  messageType: string,
  options: Omit<FetchInAppMessagesOptions, "page_size"> = {},
) => {
  const { messages, ...info } = useInAppMessages(messageType, {
    ...options,
    page_size: 1,
  });

  return { message: messages[0], ...info };
};
