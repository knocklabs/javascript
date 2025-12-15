import { GetMsTeamsChannelsResponse, MsTeamsChannel } from "@knocklabs/client";
import { useCallback, useEffect, useRef } from "react";
import useSWR from "swr";

import { useKnockClient } from "../../core";
import { useKnockMsTeamsClient } from "../context";
import { MsTeamsChannelQueryOptions } from "../interfaces";

const QUERY_KEY = "MS_TEAMS_CHANNELS";

type UseMsTeamsChannelsProps = {
  teamId?: string;
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
  const { knockMsTeamsChannelId, tenantId, connectionStatus } =
    useKnockMsTeamsClient();

  // Track previous tenant/channel/connectionStatus to detect changes and clear cache
  const prevTenantRef = useRef(tenantId);
  const prevChannelRef = useRef(knockMsTeamsChannelId);
  const prevConnectionStatusRef = useRef(connectionStatus);

  const fetchChannels = useCallback(
    () =>
      knock.msTeams.getChannels({
        knockChannelId: knockMsTeamsChannelId,
        tenant: tenantId,
        teamId: teamId!,
        queryOptions: {
          $filter: queryOptions?.filter,
          $select: queryOptions?.select,
        },
      }),
    [knock.msTeams, knockMsTeamsChannelId, tenantId, teamId, queryOptions],
  );

  // Include tenantId and knockMsTeamsChannelId in the cache key so that
  // SWR treats different tenants as different cache entries
  const { data, isLoading, isValidating, mutate } =
    useSWR<GetMsTeamsChannelsResponse>(
      teamId && connectionStatus === "connected"
        ? [QUERY_KEY, tenantId, knockMsTeamsChannelId, teamId]
        : null,
      fetchChannels,
      { revalidateOnFocus: false },
    );

  // Clear cache when tenant, channel, or connection status changes
  // This ensures that when the user disconnects and reconnects (possibly to a different
  // MS Teams workspace), or when the access token is revoked, the cached channels are cleared
  useEffect(() => {
    const tenantChanged = prevTenantRef.current !== tenantId;
    const channelChanged = prevChannelRef.current !== knockMsTeamsChannelId;
    // Detect when connection is re-established (was not connected, now is connected)
    const wasConnected = prevConnectionStatusRef.current === "connected";
    const isConnected = connectionStatus === "connected";
    const connectionReestablished = !wasConnected && isConnected;

    if (tenantChanged || channelChanged || connectionReestablished) {
      // Reset the SWR state to clear cached data
      mutate(undefined, { revalidate: false });
    }

    prevTenantRef.current = tenantId;
    prevChannelRef.current = knockMsTeamsChannelId;
    prevConnectionStatusRef.current = connectionStatus;
  }, [tenantId, knockMsTeamsChannelId, connectionStatus, mutate]);

  return {
    data: data?.ms_teams_channels ?? [],
    isLoading: isLoading || isValidating,
    refetch: () => mutate(),
  };
}

export default useMsTeamsChannels;
