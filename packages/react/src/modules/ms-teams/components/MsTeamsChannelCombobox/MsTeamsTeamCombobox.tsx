import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsTeamQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsTeams,
} from "@knocklabs/react-core";
import { Combobox } from "@telegraph/combobox";
import { Box } from "@telegraph/layout";
import { FunctionComponent, useCallback, useMemo } from "react";

import { sortByDisplayName } from "../../utils";

interface MsTeamsTeamComboboxProps {
  team: MsTeamsTeam | null;
  onTeamChange: (team: MsTeamsTeam) => void;
  getChannelCount: (teamId: string) => number;
  queryOptions?: MsTeamsTeamQueryOptions;
}

export const MsTeamsTeamCombobox: FunctionComponent<
  MsTeamsTeamComboboxProps
> = ({ team, onTeamChange, getChannelCount, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();

  const { data: teams, isLoading: isLoadingTeams } = useMsTeamsTeams({
    queryOptions,
  });

  const sortedTeams = useMemo(() => sortByDisplayName(teams), [teams]);

  const inErrorState = useMemo(
    () => connectionStatus === "disconnected" || connectionStatus === "error",
    [connectionStatus],
  );

  const inLoadingState = useMemo(
    () =>
      connectionStatus === "connecting" ||
      connectionStatus === "disconnecting" ||
      isLoadingTeams,
    [connectionStatus, isLoadingTeams],
  );

  const teamToOption = useCallback(
    (team: MsTeamsTeam) => {
      const channelCount = getChannelCount(team.id);
      return {
        value: team.id,
        label:
          channelCount > 0
            ? `${team.displayName} (${channelCount})`
            : team.displayName,
      };
    },
    [getChannelCount],
  );

  return (
    <Box w="full">
      <Combobox.Root
        value={team ? teamToOption(team) : undefined}
        onValueChange={({ value: teamId }) => {
          const selectedTeam = sortedTeams.find((team) => team.id === teamId);
          if (selectedTeam) {
            onTeamChange(selectedTeam);
          }
        }}
        placeholder="Select team"
        disabled={inErrorState || inLoadingState || sortedTeams.length === 0}
      >
        <Combobox.Trigger />
        <Combobox.Content>
          <Combobox.Search />
          <Combobox.Options
            style={
              // Overrides combobox defaults; using maxHeight prop on Combobox.Options does not work
              { overflowY: "auto", maxHeight: "144px" }
            }
          >
            {sortedTeams.map((team) => (
              <Combobox.Option key={team.id} {...teamToOption(team)} />
            ))}
          </Combobox.Options>
          <Combobox.Empty />
        </Combobox.Content>
      </Combobox.Root>
    </Box>
  );
};
