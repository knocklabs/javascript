import { MsTeamsChannelConnection } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  RecipientObject,
  useConnectedMsTeamsChannels,
  useKnockMsTeamsClient,
  useMsTeamsChannels,
} from "@knocklabs/react-core";
import { Combobox } from "@telegraph/combobox";
import { Box } from "@telegraph/layout";
import { FunctionComponent, useCallback, useMemo } from "react";

import { sortByDisplayName } from "../../utils";

import MsTeamsErrorMessage from "./MsTeamsErrorMessage";

interface MsTeamsChannelInTeamComboboxProps {
  teamId?: string;
  msTeamsChannelsRecipientObject: RecipientObject;
  queryOptions?: MsTeamsChannelQueryOptions;
}

export const MsTeamsChannelInTeamCombobox: FunctionComponent<
  MsTeamsChannelInTeamComboboxProps
> = ({ teamId, msTeamsChannelsRecipientObject, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();

  const { data: availableChannels = [] } = useMsTeamsChannels({
    teamId,
    queryOptions,
  });

  const sortedChannels = useMemo(
    () => sortByDisplayName(availableChannels),
    [availableChannels],
  );

  const {
    data: currentConnections,
    updateConnectedChannels,
    error: connectedChannelsError,
  } = useConnectedMsTeamsChannels({ msTeamsChannelsRecipientObject });

  const inErrorState = useMemo(
    () =>
      connectionStatus === "disconnected" ||
      connectionStatus === "error" ||
      !!connectedChannelsError,
    [connectionStatus, connectedChannelsError],
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

  const comboboxValue = useMemo(
    () =>
      currentConnections
        ?.filter(
          (connection) =>
            connection.ms_teams_channel_id &&
            isChannelInThisTeam(connection.ms_teams_channel_id),
        )
        .map((connection) => connection.ms_teams_channel_id),
    [currentConnections, isChannelInThisTeam],
  );

  return (
    <>
      <Box w="full" minW="0">
        <Combobox.Root
          value={comboboxValue}
          onValueChange={(channelIds) => {
            const connectedChannelsInThisTeam =
              channelIds.map<MsTeamsChannelConnection>((channelId) => ({
                ms_teams_team_id: teamId,
                ms_teams_channel_id: channelId,
              }));
            const connectedChannelsInOtherTeams =
              currentConnections?.filter(
                (connection) =>
                  !connection.ms_teams_channel_id ||
                  !isChannelInThisTeam(connection.ms_teams_channel_id),
              ) ?? [];

            const updatedConnections = [
              ...connectedChannelsInOtherTeams,
              ...connectedChannelsInThisTeam,
            ];

            updateConnectedChannels(updatedConnections).catch(console.error);
          }}
          placeholder="Select channels"
          disabled={
            teamId === undefined ||
            inErrorState ||
            inLoadingState ||
            availableChannels.length === 0
          }
          closeOnSelect={false}
          layout="wrap"
          modal={
            // Modal comboboxes cause page layout to shift when body has padding. See KNO-7854.
            false
          }
        >
          <Combobox.Trigger />
          <Combobox.Content>
            <Combobox.Search className="rtk-combobox__search" />
            <Combobox.Options maxHeight="36">
              {sortedChannels.map((channel) => (
                <Combobox.Option key={channel.id} value={channel.id}>
                  {channel.displayName}
                </Combobox.Option>
              ))}
            </Combobox.Options>
            <Combobox.Empty />
          </Combobox.Content>
        </Combobox.Root>
      </Box>
      {!!connectedChannelsError && (
        <MsTeamsErrorMessage message={connectedChannelsError} />
      )}
    </>
  );
};
