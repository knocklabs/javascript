import { GetMsTeamsChannelsResponse, MsTeamsChannel } from "@knocklabs/client";
import useSWR from "swr";

import { useKnockClient } from "../../core";
import { useKnockMsTeamsClient } from "../context";

const QUERY_KEY = "MS_TEAMS_CHANNELS";

type UseMsTeamsChannelsProps = {
  teamId: string;
  queryOptions?: {};
};

type UseMsTeamsChannelsOutput = {
  data: MsTeamsChannel[];
  isLoading: boolean;
  refetch: () => void;
};

function useMsTeamsChannels({
  teamId,
}: UseMsTeamsChannelsProps): UseMsTeamsChannelsOutput {
  const knock = useKnockClient();
  const { knockMsTeamsChannelId, tenantId } = useKnockMsTeamsClient();

  const fetchChannels = () => {
    return knock.msTeams.getChannels({
      knockChannelId: knockMsTeamsChannelId,
      tenant: tenantId,
      teamId,
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
