import { GetMsTeamsChannelsResponse, MsTeamsChannel } from "@knocklabs/client";
import useSWR from "swr";

import { useKnockClient } from "../../core";
import { useKnockMsTeamsClient } from "../context";
import { MsTeamsChannelQueryOptions } from "../interfaces";

const QUERY_KEY = "MS_TEAMS_CHANNELS";

type UseMsTeamsChannelsProps = {
  teamId: string;
  queryOptions?: MsTeamsChannelQueryOptions;
};

type UseMsTeamsChannelsOutput = {
  data: MsTeamsChannel[];
  isLoading: boolean;
  refetch: () => void;
};

function useMsTeamsChannels({
  teamId,
  queryOptions,
}: UseMsTeamsChannelsProps): UseMsTeamsChannelsOutput {
  const knock = useKnockClient();
  const { knockMsTeamsChannelId, tenantId } = useKnockMsTeamsClient();

  const fetchChannels = () => {
    return knock.msTeams.getChannels({
      knockChannelId: knockMsTeamsChannelId,
      tenant: tenantId,
      teamId,
      queryOptions: {
        $filter: queryOptions?.filter,
        $select: queryOptions?.select,
      },
    });
  };

  const { data, isLoading, isValidating, mutate } =
    useSWR<GetMsTeamsChannelsResponse>([QUERY_KEY], fetchChannels, {});

  return {
    data: data?.ms_teams_channels ?? [],
    isLoading: isLoading || isValidating,
    refetch: () => mutate(),
  };
}

export default useMsTeamsChannels;
