import { SlackChannelQueryOptions, useKnockSlackClient } from "..";
import { GetSlackChannelsResponse, SlackChannel } from "@knocklabs/client";
import { useEffect, useMemo } from "react";
import useSWRInfinite from "swr/infinite";

import { useKnockClient } from "../../core";

const MAX_COUNT = 1000;
const LIMIT_PER_PAGE = 4;
const CHANNEL_TYPES = "private_channel,public_channel";

const QUERY_KEY = "SLACK_CHANNELS";

type UseSlackChannelsProps = {
  queryOptions?: SlackChannelQueryOptions;
};

type UseSlackChannelOutput = {
  data: SlackChannel[];
  isLoading: boolean;
  refetch: () => void;
};

type QueryKey = [key: string, cursor: string] | null;

function getQueryKey(
  pageIndex: number,
  previousPageData: GetSlackChannelsResponse,
): QueryKey {
  // First page so just pass empty
  if (pageIndex === 0) {
    return [QUERY_KEY, ""];
  }

  // If there's no more data then return an empty next cursor
  if (previousPageData && ["", null].includes(previousPageData.next_cursor)) {
    return null;
  }

  // Next cursor exists so pass it
  return [QUERY_KEY, previousPageData.next_cursor ?? ""];
}

function useSlackChannels({
  queryOptions,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knock = useKnockClient();
  const { knockSlackChannelId, tenantId, connectionStatus } =
    useKnockSlackClient();

  const fetchChannels = (queryKey: QueryKey) => {
    return knock.slack.getChannels({
      tenant: tenantId,
      knockChannelId: knockSlackChannelId,
      queryOptions: {
        ...queryOptions,
        cursor: queryKey?.[1],
        limit: queryOptions?.limitPerPage || LIMIT_PER_PAGE,
        types: queryOptions?.types || CHANNEL_TYPES,
      },
    });
  };

  const { data, error, isLoading, isValidating, setSize, mutate } =
    useSWRInfinite<GetSlackChannelsResponse>(getQueryKey, fetchChannels, {
      initialSize: 0,
      revalidateFirstPage: false,
    });

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
