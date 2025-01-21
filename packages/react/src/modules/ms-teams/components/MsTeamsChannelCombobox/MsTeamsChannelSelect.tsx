import { MsTeamsChannel } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsChannels,
} from "@knocklabs/react-core";
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

  const { data: availableChannels } = useMsTeamsChannels({
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

  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      Select channels
      <select
        multiple
        disabled={
          teamId === undefined ||
          inErrorState ||
          inLoadingState ||
          availableChannels.length === 0
        }
        value={selectedChannels.map((channel) => channel.id)}
        onChange={(e) => {
          const selectedOptions = Array.from(e.target.selectedOptions);
          const selectedChannelsList = selectedOptions
            .map((option) =>
              availableChannels.find((channel) => channel.id === option.value),
            )
            .filter(
              (channel): channel is MsTeamsChannel => channel !== undefined,
            );

          onMsTeamsChannelsChange(selectedChannelsList);
        }}
      >
        {availableChannels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.displayName}
          </option>
        ))}
      </select>
    </label>
  );
};
