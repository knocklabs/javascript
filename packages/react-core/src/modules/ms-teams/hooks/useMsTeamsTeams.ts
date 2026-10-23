import { GetMsTeamsTeamsResponse, MsTeamsTeam } from "@knocklabs/client";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useSWRInfinite from "swr/infinite";

import { useKnockClient } from "../../core";
import { useKnockMsTeamsClient } from "../context";
import { MsTeamsTeamQueryOptions } from "../interfaces";

const MAX_COUNT = 1000;

const QUERY_KEY = "MS_TEAMS_TEAMS";

type UseMsTeamsTeamsOptions = {
  queryOptions?: MsTeamsTeamQueryOptions;
};

type UseMsTeamsTeamsOutput = {
  data: MsTeamsTeam[];
  isLoading: boolean;
  refetch: () => void;
};

type QueryKey =
  | [key: string, tenantId: string, channelId: string, skiptoken: string]
  | null;

function useMsTeamsTeams({
  queryOptions = {},
}: UseMsTeamsTeamsOptions): UseMsTeamsTeamsOutput {
  const knock = useKnockClient();
  const { knockMsTeamsChannelId, tenantId, connectionStatus } =
    useKnockMsTeamsClient();

  // Track previous tenant/channel/connectionStatus to detect changes and clear cache
  const prevTenantRef = useRef(tenantId);
  const prevChannelRef = useRef(knockMsTeamsChannelId);
  const prevConnectionStatusRef = useRef(connectionStatus);

  // Create a getQueryKey function that includes tenantId and knockMsTeamsChannelId
  // so that SWR treats different tenants as different cache entries
  const getQueryKey = useCallback(
    (
      pageIndex: number,
      previousPageData: GetMsTeamsTeamsResponse | null,
    ): QueryKey => {
      // Don't fetch if not connected
      if (connectionStatus !== "connected") {
        return null;
      }

      // First page so just pass empty
      if (pageIndex === 0) {
        return [QUERY_KEY, tenantId, knockMsTeamsChannelId, ""];
      }

      // If there's no more data then return an empty next skiptoken
      if (
        previousPageData &&
        ["", null].includes(previousPageData.skip_token)
      ) {
        return null;
      }

      // Next skiptoken exists so pass it
      return [
        QUERY_KEY,
        tenantId,
        knockMsTeamsChannelId,
        previousPageData?.skip_token ?? "",
      ];
    },
    [tenantId, knockMsTeamsChannelId, connectionStatus],
  );

  const fetchTeams = useCallback(
    (queryKey: QueryKey) =>
      knock.msTeams.getTeams({
        knockChannelId: knockMsTeamsChannelId,
        tenant: tenantId,
        queryOptions: {
          $skiptoken: queryKey?.[3],
          $top: queryOptions?.limitPerPage,
          $filter: queryOptions?.filter,
          $select: queryOptions?.select,
        },
      }),
    [knock.msTeams, knockMsTeamsChannelId, tenantId, queryOptions],
  );

  const { data, error, isLoading, isValidating, setSize, mutate } =
    useSWRInfinite<GetMsTeamsTeamsResponse>(getQueryKey, fetchTeams, {
      initialSize: 0,
      revalidateOnFocus: false,
      revalidateFirstPage: false,
    });

  // Clear cache when tenant, channel, or connection status changes
  // This ensures that when the user disconnects and reconnects (possibly to a different
  // MS Teams workspace), or when the access token is revoked, the cached teams are cleared
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
      setSize(0);
    }

    prevTenantRef.current = tenantId;
    prevChannelRef.current = knockMsTeamsChannelId;
    prevConnectionStatusRef.current = connectionStatus;
  }, [tenantId, knockMsTeamsChannelId, connectionStatus, mutate, setSize]);

  const lastPage = data?.at(-1);
  const hasNextPage = lastPage === undefined || !!lastPage.skip_token;

  const teams = useMemo(
    () =>
      (data ?? [])
        .flatMap((page) => page?.ms_teams_teams)
        .filter((team) => !!team),
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
      teams.length < maxCount
    ) {
      // Fetch a page at a time until we have nothing else left to fetch
      // or we've already hit the max amount of teams to fetch
      setSize((size) => size + 1);
    }
  }, [
    teams.length,
    setSize,
    hasNextPage,
    isLoading,
    isValidating,
    maxCount,
    error,
    connectionStatus,
  ]);

  return {
    data: teams,
    isLoading: isLoading || isValidating,
    refetch: () => mutate(),
  };
}

export default useMsTeamsTeams;
