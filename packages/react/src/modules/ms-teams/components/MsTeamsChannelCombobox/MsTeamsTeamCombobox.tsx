import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsTeamQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsTeams,
} from "@knocklabs/react-core";
import { Combobox } from "@telegraph/combobox";
import { Box } from "@telegraph/layout";
import { FunctionComponent, useMemo } from "react";

interface MsTeamsTeamComboboxProps {
  team?: MsTeamsTeam;
  onTeamChange: (team: MsTeamsTeam) => void;
  queryOptions?: MsTeamsTeamQueryOptions;
}

export const MsTeamsTeamCombobox: FunctionComponent<
  MsTeamsTeamComboboxProps
> = ({ team, onTeamChange, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();

  const { data: teams, isLoading: isLoadingTeams } = useMsTeamsTeams({
    queryOptions,
  });

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

  return (
    <Box w="full">
      <Combobox.Root
        value={
          team
            ? {
                value: team.id,
                label: team.displayName,
              }
            : undefined
        }
        onValueChange={({ value: teamId }) => {
          const selectedTeam = teams.find((team) => team.id === teamId);
          if (selectedTeam) {
            onTeamChange(selectedTeam);
          }
        }}
        placeholder="Select team"
        disabled={inErrorState || inLoadingState}
      >
        <Combobox.Trigger />
        <Combobox.Content>
          <Combobox.Search />
          <Combobox.Options>
            {teams.map((team) => (
              <Combobox.Option
                key={team.id}
                value={team.id}
                label={team.displayName}
              />
            ))}
          </Combobox.Options>
          <Combobox.Empty />
        </Combobox.Content>
      </Combobox.Root>
    </Box>
  );
};
