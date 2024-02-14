import { ContainerObject, SlackChannelQueryOptions } from "..";
import { SlackChannel } from "@knocklabs/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import { useKnockClient } from "../../core";

const MAX_COUNT = 1000;
const LIMIT_PER_PAGE = 200;
const CHANNEL_TYPES = "private_channel,public_channel";

type UseSlackChannelsProps = {
  tenant: string;
  connectionsObject: ContainerObject;
  queryOptions?: SlackChannelQueryOptions;
  knockSlackChannelId: string;
};

type UseSlackChannelOutput = {
  data: SlackChannel[];
  isLoading: boolean;
  refetch: () => void;
};

function useSlackChannels({
  tenant,
  connectionsObject,
  knockSlackChannelId,
  queryOptions,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knock = useKnockClient();

  const fetchChannels = ({ pageParam }: { pageParam: string }) => {
    return knock.slack.getChannels({
      tenant,
      connectionsObject,
      knockChannelId: knockSlackChannelId,
      queryOptions: {
        ...queryOptions,
        cursor: pageParam,
        limit: queryOptions?.limitPerPage || LIMIT_PER_PAGE,
        types: queryOptions?.types || CHANNEL_TYPES,
      },
    });
  };

  const { data, isLoading, isFetching, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery({
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
    if (hasNextPage && !isFetching && slackChannels?.length < maxCount) {
      fetchNextPage();
    }
  }, [slackChannels?.length, fetchNextPage, hasNextPage, isFetching, maxCount]);

  return { data: slackChannels, isLoading, refetch };
}

export default useSlackChannels;