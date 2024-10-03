import {
  InAppMessage,
  InAppMessagesClient,
  InAppMessagesClientOptions,
  NetworkStatus,
} from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useStore } from "@tanstack/react-store";
import { useEffect, useMemo } from "react";

import { useStableOptions } from "../../core";
import { useInAppMessagesChannel } from "../context";

export interface UseInAppMessagesOptions extends InAppMessagesClientOptions {}

export interface UseInAppMessagesResponse<
  TContent extends GenericData,
  TData extends GenericData,
> {
  messages: InAppMessage<TContent, TData>[];
  networkStatus: NetworkStatus;
  loading: boolean;
  inAppMessagesClient: InAppMessagesClient;
}

export const useInAppMessages = <
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
>(
  messageType: string,
  options: UseInAppMessagesOptions = {},
): UseInAppMessagesResponse<TContent, TData> => {
  const { inAppMessagesChannelClient } = useInAppMessagesChannel();

  const stableOptions = useStableOptions(options);

  const inAppMessagesClient = useMemo(() => {
    return new InAppMessagesClient(
      inAppMessagesChannelClient,
      messageType,
      stableOptions,
    );
  }, [inAppMessagesChannelClient, messageType, stableOptions]);

  const { messages, networkStatus, loading } = useStore(
    inAppMessagesChannelClient.store,
    (state) => inAppMessagesClient.getQueryInfoSelector<TContent, TData>(state),
  );

  useEffect(() => {
    inAppMessagesClient.fetch();
    inAppMessagesClient.subscribe();

    return () => {
      inAppMessagesClient.unsubscribe()
    }
  }, []);

  return { messages, networkStatus, loading, inAppMessagesClient };
};

export type UseInAppMessageOptions = Omit<UseInAppMessagesOptions, "page_size">;

export interface UseInAppMessageResponse<
  TContent extends GenericData,
  TData extends GenericData,
> extends GenericData {
  message?: InAppMessage<TContent, TData>;
  networkStatus: NetworkStatus;
  loading: boolean;
  inAppMessagesClient: InAppMessagesClient;
}

export const useInAppMessage = <
  TContent extends GenericData = GenericData,
  TData extends GenericData = GenericData,
>(
  messageType: string,
  options: UseInAppMessageOptions = {},
): UseInAppMessageResponse<TContent, TData> => {
  const { messages, ...rest } = useInAppMessages<TContent, TData>(messageType, {
    ...options,
    page_size: 1,
  });

  return { message: messages[0], ...rest };
};
