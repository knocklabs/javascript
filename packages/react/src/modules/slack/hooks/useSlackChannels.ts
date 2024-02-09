import { useKnockClient } from "@knocklabs/react-core";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const MAX_COUNT = 1000;
const LIMIT_PER_PAGE = 200;

export interface SlackChannel {
  name: string;
  id: string;
  is_private: boolean;
  is_im: boolean;
  context_team_id: boolean;
}

export type ContainerObject = {
  objectId: string;
  collection: string;
};

type SlackChannelQueryOptions = {
  maxCount?: number;
  limitPerPage?: number;
  excludeArchived?: boolean;
  types?: string;
  teamId?: string;
};

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

export function useSlackChannels({
  tenant,
  connectionsObject,
  knockSlackChannelId,
  queryOptions,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knockClient = useKnockClient();

  const fetchChannels = ({ pageParam }: { pageParam: string }) => {
    return knockClient.slack.getChannels({
      tenant,
      connectionsObject,
      knockChannelId: knockSlackChannelId,
      queryOptions: {
        ...queryOptions,
        cursor: pageParam,
        limit: queryOptions?.limitPerPage || LIMIT_PER_PAGE,
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

  const slackChannels =
    data?.pages
      ?.flatMap((page) => page?.slack_channels)
      .filter((channel) => !!channel) || [];

  const maxCount = queryOptions?.maxCount || MAX_COUNT;

  useEffect(() => {
    if (hasNextPage && !isFetching && slackChannels?.length < maxCount) {
      fetchNextPage();
    }
  }, [slackChannels?.length, fetchNextPage, hasNextPage, isFetching, maxCount]);

  return { data: slackChannels, isLoading, refetch };
}
