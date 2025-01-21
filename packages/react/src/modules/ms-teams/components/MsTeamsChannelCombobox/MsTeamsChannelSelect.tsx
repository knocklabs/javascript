import { MsTeamsChannel } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  useKnockMsTeamsClient,
  useMsTeamsChannels,
} from "@knocklabs/react-core";
import { FunctionComponent, useMemo } from "react";

interface MsTeamsChannelSelectProps {
  teamId?: string;
  msTeamsChannel?: MsTeamsChannel;
  onMsTeamsChannelChange: (msTeamsChannel: MsTeamsChannel) => void;
  queryOptions?: MsTeamsChannelQueryOptions;
}

export const MsTeamsChannelSelect: FunctionComponent<
  MsTeamsChannelSelectProps
> = ({ teamId, msTeamsChannel, onMsTeamsChannelChange, queryOptions }) => {
  const { connectionStatus } = useKnockMsTeamsClient();

  const { data: msTeamsChannels } = useMsTeamsChannels({
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
        disabled={
          teamId === undefined ||
          inErrorState ||
          inLoadingState ||
          msTeamsChannels.length === 0
        }
        value={msTeamsChannel?.id}
        onChange={(e) => {
          const selectedChannel = msTeamsChannels?.find(
            (channel) => channel.id === e.target.value,
          );
          if (selectedChannel) {
            onMsTeamsChannelChange(selectedChannel);
          }
        }}
      >
        {msTeamsChannels.map((channel) => (
          <option key={channel.id} value={channel.id}>
            {channel.displayName}
          </option>
        ))}
      </select>
    </label>
  );
};
