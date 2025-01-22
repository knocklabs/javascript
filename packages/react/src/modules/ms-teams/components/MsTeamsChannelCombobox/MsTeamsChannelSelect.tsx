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

interface MsTeamsChannelSelectProps {
  teamId?: string;
  msTeamsChannelsRecipientObject: RecipientObject;
  queryOptions?: MsTeamsChannelQueryOptions;
}

export const MsTeamsChannelSelect: FunctionComponent<
  MsTeamsChannelSelectProps
> = ({ teamId, msTeamsChannelsRecipientObject, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();

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
          return {
            value: connection.ms_teams_channel_id!,
            label: channel?.displayName ?? "Loading…",
          };
        }),
    [currentConnections, isChannelInThisTeam, availableChannels],
  );

  return (
    <Box w="full">
      <Combobox.Root
        value={comboboxValue}
        onValueChange={(newValues) => {
          const connectedChannelsInThisTeam =
            newValues.map<MsTeamsChannelConnection>(({ value: channelId }) => ({
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
      >
        <Combobox.Trigger />
        <Combobox.Content>
          <Combobox.Search />
          <Combobox.Options>
            {availableChannels.map((channel) => (
              <Combobox.Option
                key={channel.id}
                value={channel.id}
                label={channel.displayName}
              />
            ))}
          </Combobox.Options>
          <Combobox.Empty />
        </Combobox.Content>
      </Combobox.Root>
    </Box>
  );
};
