import { SlackChannelQueryOptions, useKnockSlackClient } from "..";
import { GetSlackChannelsResponse, SlackChannel } from "@knocklabs/client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";

import { useKnockClient } from "../../core";

const MAX_COUNT = 1000;
const LIMIT_PER_PAGE = 200;
const CHANNEL_TYPES = "private_channel,public_channel";

const QUERY_KEY = "SLACK_CHANNELS";

type UseSlackChannelsOptions = {
  queryOptions?: SlackChannelQueryOptions;
};

type UseSlackChannelOutput = {
  data: SlackChannel[];
  isLoading: boolean;
  refetch: () => void;
};

type QueryKey =
  | [key: string, tenantId: string, channelId: string, cursor: string]
  | null;

function useSlackChannels({
  queryOptions,
}: UseSlackChannelsOptions): UseSlackChannelOutput {
  const knock = useKnockClient();
  const { knockSlackChannelId, tenantId, connectionStatus } =
    useKnockSlackClient();

  // Track previous tenant/channel/connectionStatus to detect changes and clear cache
  const prevTenantRef = useRef(tenantId);
  const prevChannelRef = useRef(knockSlackChannelId);
  const prevConnectionStatusRef = useRef(connectionStatus);

  // Create a getQueryKey function that includes tenantId and knockSlackChannelId
  // so that SWR treats different tenants as different cache entries
  const getQueryKey = useCallback(
    (
      pageIndex: number,
      previousPageData: GetSlackChannelsResponse | null,
    ): QueryKey => {
      // Don't fetch if not connected
      if (connectionStatus !== "connected") {
        return null;
      }

      // First page so just pass empty
      if (pageIndex === 0) {
        return [QUERY_KEY, tenantId, knockSlackChannelId, ""];
      }

      // If there's no more data then return an empty next cursor
      if (
        previousPageData &&
        ["", null].includes(previousPageData.next_cursor)
      ) {
        return null;
      }

      // Next cursor exists so pass it
      return [
        QUERY_KEY,
        tenantId,
        knockSlackChannelId,
        previousPageData?.next_cursor ?? "",
      ];
    },
    [tenantId, knockSlackChannelId, connectionStatus],
  );

  const fetchChannels = useCallback(
    (queryKey: QueryKey) => {
      return knock.slack.getChannels({
        tenant: tenantId,
        knockChannelId: knockSlackChannelId,
        queryOptions: {
          ...queryOptions,
          cursor: queryKey?.[3],
          limit: queryOptions?.limitPerPage || LIMIT_PER_PAGE,
          types: queryOptions?.types || CHANNEL_TYPES,
        },
      });
    },
    [knock.slack, tenantId, knockSlackChannelId, queryOptions],
  );

  const { data, error, isLoading, isValidating, setSize, mutate } =
    useSWRInfinite<GetSlackChannelsResponse>(getQueryKey, fetchChannels, {
      initialSize: 0,
      revalidateFirstPage: false,
    });

  // Clear cache when tenant, channel, or connection status changes
  // This ensures that when the user disconnects and reconnects (possibly to a different
  // Slack workspace), or when the access token is revoked, the cached channels are cleared
  useEffect(() => {
    const tenantChanged = prevTenantRef.current !== tenantId;
    const channelChanged = prevChannelRef.current !== knockSlackChannelId;
    // Detect when connection is re-established (was not connected, now is connected)
    const wasConnected = prevConnectionStatusRef.current === "connected";
    const isConnected = connectionStatus === "connected";
    const connectionReestablished = !wasConnected && isConnected;

    if (tenantChanged || channelChanged || connectionReestablished) {
      // Reset the SWR state to clear cached data
      mutate(undefined, { revalidate: false });
      setSize(0);
    }

    prevTenantRef.current = tenantId;
    prevChannelRef.current = knockSlackChannelId;
    prevConnectionStatusRef.current = connectionStatus;
  }, [tenantId, knockSlackChannelId, connectionStatus, mutate, setSize]);

  const lastPage = data?.at(-1);
  const hasNextPage = lastPage === undefined || !!lastPage.next_cursor;

  const slackChannels: SlackChannel[] = useMemo(
    () =>
      (data ?? [])
        .flatMap((page) => page?.slack_channels)
        .filter((channel) => !!channel),
    [data],
  );

  const maxCount = queryOptions?.maxCount || MAX_COUNT;

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      !error &&
      hasNextPage &&
      !isLoading &&
      !isValidating &&
      slackChannels.length < maxCount
    ) {
      // Fetch a page at a time until we have nothing else left to fetch
      // or we've already hit the max amount of channels to fetch
      setSize((size) => size + 1);
    }
  }, [
    slackChannels.length,
    setSize,
    hasNextPage,
    isLoading,
    isValidating,
    maxCount,
    error,
    connectionStatus,
  ]);

  return {
    data: slackChannels,
    isLoading: isLoading || isValidating,
    refetch: () => mutate(),
  };
}

export default useSlackChannels;
