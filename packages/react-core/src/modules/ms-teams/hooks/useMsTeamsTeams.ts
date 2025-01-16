import { GetMsTeamsTeamsResponse, MsTeamsTeam } from "@knocklabs/client";
import { useEffect, useMemo } from "react";
import useSWRInfinite from "swr/infinite";

import { useKnockClient } from "../../core";
import { useKnockMsTeamsClient } from "../context";
import { MsTeamsTeamQueryOptions } from "../interfaces";

const MAX_COUNT = 1000;

const QUERY_KEY = "MS_TEAMS_TEAMS";

type UseMsTeamsTeamsProps = {
  queryOptions?: MsTeamsTeamQueryOptions;
};

type UseMsTeamsTeamsOutput = {
  data: MsTeamsTeam[];
  isLoading: boolean;
  refetch: () => void;
};

type QueryKey = [key: string, skiptoken: string] | null;

function getQueryKey(
  pageIndex: number,
  previousPageData: GetMsTeamsTeamsResponse,
): QueryKey {
  // First page so just pass empty
  if (pageIndex === 0) {
    return [QUERY_KEY, ""];
  }

  // If there's no more data then return an empty next skiptoken
  if (previousPageData && ["", null].includes(previousPageData.skip_token)) {
    return null;
  }

  // Next skiptoken exists so pass it
  return [QUERY_KEY, previousPageData.skip_token ?? ""];
}

function useMsTeamsTeams({
  queryOptions = {},
}: UseMsTeamsTeamsProps): UseMsTeamsTeamsOutput {
  const knock = useKnockClient();
  const { knockMsTeamsChannelId, tenantId, connectionStatus } =
    useKnockMsTeamsClient();

  const fetchTeams = (queryKey: QueryKey) => {
    return knock.msTeams.getTeams({
      knockChannelId: knockMsTeamsChannelId,
      tenant: tenantId,
      queryOptions: {
        $skiptoken: queryKey?.[1],
        $top: queryOptions?.limitPerPage,
        $filter: queryOptions?.filter,
        $select: queryOptions?.select,
      },
    });
  };

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<GetMsTeamsTeamsResponse>(getQueryKey, fetchTeams, {
      initialSize: 0,
    });

  const currentPage = data?.length || 0;

  const hasNextPage =
    currentPage === 0 ||
    (data &&
      data[currentPage]?.skip_token &&
      data[currentPage]?.skip_token !== "");

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
      // or we've already hit the max amount of channels to fetch
      setSize(size + 1);
    }
  }, [
    teams.length,
    setSize,
    size,
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
