import { MsTeamsChannel, MsTeamsChannelConnection } from "@knocklabs/client";
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

import {
  fromLabelSearchableOption,
  sortByDisplayName,
  toLabelSearchableOption,
} from "../../utils";

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

  const channelToOption = useCallback(
    (channel: MsTeamsChannel) =>
      toLabelSearchableOption({
        value: channel.id,
        label: channel.displayName,
      }),
    [],
  );

  const comboboxValue = useMemo(
    () =>
      currentConnections
        ?.filter(
          (connection) =>
            connection.ms_teams_channel_id &&
            isChannelInThisTeam(connection.ms_teams_channel_id),
        )
        .map((connection) => {
          const channel = availableChannels.find(
            (c) => c.id === connection.ms_teams_channel_id,
          );
          return channel
            ? channelToOption(channel)
            : { label: "Loading…", value: connection.ms_teams_channel_id! };
        }),
    [
      currentConnections,
      isChannelInThisTeam,
      availableChannels,
      channelToOption,
    ],
  );

  return (
    <>
      <Box w="full" minW="0">
        <Combobox.Root
          value={comboboxValue}
          onValueChange={(searchableOptions) => {
            const options = searchableOptions.map(fromLabelSearchableOption);
            const connectedChannelsInThisTeam =
              options.map<MsTeamsChannelConnection>(({ value: channelId }) => ({
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
        >
          <Combobox.Trigger />
          <Combobox.Content>
            <Combobox.Search />
            <Combobox.Options className="rtk-combobox__options">
              {sortedChannels.map((channel) => (
                <Combobox.Option
                  key={channel.id}
                  {...channelToOption(channel)}
                />
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
