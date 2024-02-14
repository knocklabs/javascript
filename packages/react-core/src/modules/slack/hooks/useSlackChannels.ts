import { SlackChannelQueryOptions, useKnockSlackClient } from "..";
import { SlackChannel } from "@knocklabs/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { useKnockClient } from "../../core";

const MAX_COUNT = 1000;
const LIMIT_PER_PAGE = 200;
const CHANNEL_TYPES = "private_channel,public_channel";

type UseSlackChannelsProps = {
  queryOptions?: SlackChannelQueryOptions;
};

type UseSlackChannelOutput = {
  data: SlackChannel[];
  isLoading: boolean;
  refetch: () => void;
};

function useSlackChannels({
  queryOptions,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knock = useKnockClient();
  const { knockSlackChannelId, tenant, connectionStatus } =
    useKnockSlackClient();

  const fetchChannels = ({ pageParam }: { pageParam: string }) => {
    return knock.slack.getChannels({
      tenant,
      knockChannelId: knockSlackChannelId,
      queryOptions: {
        ...queryOptions,
        cursor: pageParam,
        limit: queryOptions?.limitPerPage || LIMIT_PER_PAGE,
        types: queryOptions?.types || CHANNEL_TYPES,
      },
    });
  };

  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useInfiniteQuery({
    queryKey: ["slackChannels"],
    queryFn: fetchChannels,
    initialPageParam: "",
    getNextPageParam: (lastPage) =>
      lastPage?.next_cursor === "" ? null : lastPage?.next_cursor,
  });

  const slackChannels = useMemo(() => {
    return (
      data?.pages
        ?.flatMap((page) => page?.slack_channels)
        .filter((channel) => !!channel) || []
    );
  }, [data?.pages]);

  const maxCount = queryOptions?.maxCount || MAX_COUNT;

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      !error &&
      hasNextPage &&
      !isFetching &&
      slackChannels?.length < maxCount
    ) {
      fetchNextPage();
    }
  }, [
    slackChannels?.length,
    fetchNextPage,
    hasNextPage,
    isFetching,
    maxCount,
    error,
    connectionStatus,
  ]);

  return { data: slackChannels, isLoading, refetch };
}

export default useSlackChannels;
