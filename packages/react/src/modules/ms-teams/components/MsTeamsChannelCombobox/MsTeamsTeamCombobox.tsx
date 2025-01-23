import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsTeamQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsTeams,
} from "@knocklabs/react-core";
import { useCombobox } from "downshift";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

import { strContains } from "../../../slack/components/SlackChannelCombobox/helpers";

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

  const [filteredTeams, setFilteredTeams] = useState(teams);

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

  const getTeamLabel = useCallback(
    (team: MsTeamsTeam) => {
      const channelCount = getChannelCount(team.id);
      const teamName = team.displayName ?? "Unknown team";
      return channelCount > 0 ? `${teamName} (${channelCount})` : teamName;
    },
    [getChannelCount],
  );

  const updateFilteredTeams = useCallback(
    (value: string) => {
      const nextTeams =
        value === ""
          ? teams
          : teams.filter((team) =>
              strContains(team.displayName ?? "Untitled team", value),
            );
      setFilteredTeams(nextTeams);
    },
    [teams],
  );

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    selectedItem,
  } = useCombobox({
    items: filteredTeams,
    selectedItem: team,
    onInputValueChange: ({ inputValue }) => {
      updateFilteredTeams(inputValue);
    },
    onSelectedItemChange: ({ selectedItem }) => {
      onTeamChange(selectedItem);
    },
    isItemDisabled: () => inErrorState || inLoadingState,
    itemToString: (item) => (item ? getTeamLabel(item) : ""),
  });

  return (
    <div>
      <div>
        <label {...getLabelProps()}>Select team</label>
        <div>
          <input
            placeholder="Select team"
            disabled={inErrorState || inLoadingState}
            {...getInputProps()}
          />
          <button
            type="button"
            aria-label="toggle menu"
            disabled={inErrorState || inLoadingState}
            {...getToggleButtonProps()}
          >
            {isOpen ? "▲" : "▼"}
          </button>
        </div>
      </div>
      <ul
        {...getMenuProps()}
        className="rtk-combobox__menu"
        style={{
          display: isOpen ? "block" : "none",
        }}
      >
        {filteredTeams.map((team, index) => (
          <li
            key={team.id}
            {...getItemProps({
              item: team,
              index,
            })}
            style={{
              backgroundColor:
                highlightedIndex === index ? "#bde4ff" : undefined,
              fontWeight: selectedItem === team ? "bold" : "normal",
            }}
          >
            {getTeamLabel(team)}
          </li>
        ))}
      </ul>
    </div>
  );
};
