import { MsTeamsChannelConnection } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  RecipientObject,
  useConnectedMsTeamsChannels,
  useKnockMsTeamsClient,
  useMsTeamsChannels,
} from "@knocklabs/react-core";
import { useCombobox, useMultipleSelection } from "downshift";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

interface MsTeamsChannelSelectProps {
  teamId?: string;
  msTeamsChannelsRecipientObject: RecipientObject;
  queryOptions?: MsTeamsChannelQueryOptions;
}

export const MsTeamsChannelSelect: FunctionComponent<
  MsTeamsChannelSelectProps
> = ({ teamId, msTeamsChannelsRecipientObject, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();
  const [inputValue, setInputValue] = useState("");

  const { data: availableChannels = [] } = useMsTeamsChannels({
    teamId,
    queryOptions,
  });

  const { data: currentConnections, updateConnectedChannels } =
    useConnectedMsTeamsChannels({ msTeamsChannelsRecipientObject });

  const inErrorState = useMemo(
    () => connectionStatus === "disconnected" || connectionStatus === "error",
    [connectionStatus],
  );

  const inLoadingState = useMemo(
    () =>
      connectionStatus === "connecting" || connectionStatus === "disconnecting",
    [connectionStatus],
  );

  const isChannelInThisTeam = useCallback(
    (channelId: string) =>
      availableChannels.some((channel) => channel.id === channelId),
    [availableChannels],
  );

  const selectedChannels = useMemo(() => {
    return currentConnections
      ?.filter(
        (connection) =>
          connection.ms_teams_channel_id &&
          isChannelInThisTeam(connection.ms_teams_channel_id),
      )
      .map((connection) => {
        const channel = availableChannels.find(
          (c) => c.id === connection.ms_teams_channel_id,
        );
        return channel;
      })
      .filter((channel): channel is NonNullable<typeof channel> => !!channel);
  }, [currentConnections, isChannelInThisTeam, availableChannels]);

  const filteredChannels = useMemo(() => {
    const lowerCasedInput = inputValue.toLowerCase();
    return availableChannels.filter(
      (channel) =>
        !selectedChannels?.includes(channel) &&
        (channel.displayName ?? "Untitled channel")
          .toLowerCase()
          .includes(lowerCasedInput),
    );
  }, [availableChannels, selectedChannels, inputValue]);

  const { getSelectedItemProps, getDropdownProps, removeSelectedItem } =
    useMultipleSelection({
      selectedItems: selectedChannels || [],
      onStateChange({ selectedItems: newSelectedItems, type }) {
        if (
          type ===
            useMultipleSelection.stateChangeTypes
              .SelectedItemKeyDownBackspace ||
          type ===
            useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete ||
          type ===
            useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace ||
          type ===
            useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem
        ) {
          const updatedConnections =
            currentConnections?.filter(
              (connection) =>
                !connection.ms_teams_channel_id ||
                (newSelectedItems ?? []).some(
                  (item) => item.id === connection.ms_teams_channel_id,
                ),
            ) || [];
          updateConnectedChannels(updatedConnections).catch(console.error);
        }
      },
    });

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: filteredChannels,
    itemToString: (item) => item?.displayName ?? "",
    defaultHighlightedIndex: 0,
    selectedItem: null,
    inputValue,
    stateReducer(_state, { changes, type }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
            highlightedIndex: 0,
          };
        default:
          return changes;
      }
    },
    onStateChange({
      inputValue: newInputValue,
      type,
      selectedItem: newSelectedItem,
    }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (newSelectedItem) {
            const newConnection: MsTeamsChannelConnection = {
              ms_teams_team_id: teamId,
              ms_teams_channel_id: newSelectedItem.id,
            };
            const updatedConnections = [
              ...(currentConnections || []),
              newConnection,
            ];
            updateConnectedChannels(updatedConnections).catch(console.error);
            setInputValue("");
          }
          break;

        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(newInputValue || "");
          break;
      }
    },
  });

  const isDisabled =
    teamId === undefined ||
    inErrorState ||
    inLoadingState ||
    availableChannels.length === 0;

  return (
    <div>
      <div>
        <label {...getLabelProps()}>Select channels</label>
        <div>
          {selectedChannels?.map((channel, index) => (
            <span
              key={`selected-item-${index}`}
              {...getSelectedItemProps({ selectedItem: channel, index })}
            >
              {channel.displayName}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedItem(channel);
                }}
              >
                &#10005;
              </span>
            </span>
          ))}
          <div>
            <input
              placeholder="Select channels"
              disabled={isDisabled}
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            />
            <button
              type="button"
              aria-label="toggle menu"
              disabled={isDisabled}
              {...getToggleButtonProps()}
            >
              &#8595;
            </button>
          </div>
        </div>
      </div>

      <ul {...getMenuProps()}>
        {isOpen &&
          filteredChannels.map((channel, index) => (
            <li
              key={channel.id}
              {...getItemProps({ item: channel, index })}
              style={{
                backgroundColor:
                  highlightedIndex === index ? "lightgray" : "white",
              }}
            >
              {channel.displayName}
            </li>
          ))}
      </ul>
    </div>
  );
};
