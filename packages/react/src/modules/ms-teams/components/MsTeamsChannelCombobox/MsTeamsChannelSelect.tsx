import { MsTeamsChannel } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsChannels,
} from "@knocklabs/react-core";
import { Combobox } from "@telegraph/combobox";
import { Box } from "@telegraph/layout";
import { FunctionComponent, useMemo } from "react";

interface MsTeamsChannelSelectProps {
  teamId?: string;
  msTeamsChannels: MsTeamsChannel[];
  onMsTeamsChannelsChange: (msTeamsChannels: MsTeamsChannel[]) => void;
  queryOptions?: MsTeamsChannelQueryOptions;
}

export const MsTeamsChannelSelect: FunctionComponent<
  MsTeamsChannelSelectProps
> = ({
  teamId,
  msTeamsChannels: selectedChannels = [],
  onMsTeamsChannelsChange,
  queryOptions,
}) => {
  const { connectionStatus } = useKnockMsTeamsClient();

  const { data: availableChannels = [] } = useMsTeamsChannels({
    teamId,
    queryOptions,
  });

  const inErrorState = useMemo(
    () => connectionStatus === "disconnected" || connectionStatus === "error",
    [connectionStatus],
  );

  const inLoadingState = useMemo(
    () =>
      connectionStatus === "connecting" || connectionStatus === "disconnecting",
    [connectionStatus],
  );

  const selectedValues = useMemo(
    () =>
      selectedChannels.map((channel) => ({
        value: channel.id,
        label: channel.displayName,
      })),
    [selectedChannels],
  );

  return (
    <Box className="tgph">
      <Box w="full">
        <Combobox.Root
          value={selectedValues}
          onValueChange={(newValues) => {
            const selectedChannelsList = newValues
              .map((value) =>
                availableChannels.find((channel) => channel.id === value.value),
              )
              .filter(
                (channel): channel is MsTeamsChannel => channel !== undefined,
              );

            onMsTeamsChannelsChange(selectedChannelsList);
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
    </Box>
  );
};
