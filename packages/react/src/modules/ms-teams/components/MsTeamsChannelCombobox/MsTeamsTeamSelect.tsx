import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsTeamQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsTeams,
} from "@knocklabs/react-core";
import { FunctionComponent, useMemo } from "react";

interface MsTeamsTeamSelectProps {
  team?: MsTeamsTeam;
  onTeamChange: (team: MsTeamsTeam) => void;
  queryOptions?: MsTeamsTeamQueryOptions;
}

export const MsTeamsTeamSelect: FunctionComponent<MsTeamsTeamSelectProps> = ({
  team,
  onTeamChange,
  queryOptions,
}) => {
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
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      Select team
      <select
        disabled={inErrorState || inLoadingState}
        value={team?.id}
        onChange={(e) => {
          const selectedTeam = teams.find((team) => team.id === e.target.value);
          if (selectedTeam) {
            onTeamChange(selectedTeam);
          }
        }}
      >
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.displayName}
          </option>
        ))}
      </select>
    </label>
  );
};
