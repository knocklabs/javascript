import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  MsTeamsTeamQueryOptions,
  RecipientObject,
  useConnectedMsTeamsChannels,
} from "@knocklabs/react-core";
import { Icon, Lucide } from "@telegraph/icon";
import { Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { FunctionComponent, useCallback, useState } from "react";

import { MsTeamsChannelInTeamCombobox } from "./MsTeamsChannelInTeamCombobox";
import MsTeamsConnectionError from "./MsTeamsConnectionError";
import { MsTeamsTeamCombobox } from "./MsTeamsTeamCombobox";
import "./styles.css";

interface Props {
  msTeamsChannelsRecipientObject: RecipientObject;
  teamQueryOptions?: MsTeamsTeamQueryOptions;
  channelQueryOptions?: MsTeamsChannelQueryOptions;
}

const MsTeamsChannelCombobox: FunctionComponent<Props> = ({
  msTeamsChannelsRecipientObject,
  teamQueryOptions,
  channelQueryOptions,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<MsTeamsTeam | null>(null);

  const { data: currentConnections } = useConnectedMsTeamsChannels({
    msTeamsChannelsRecipientObject,
  });

  const getChannelCount = useCallback(
    (teamId: string) =>
      currentConnections?.filter(
        (connection) => connection.ms_teams_team_id === teamId,
      ).length ?? 0,
    [currentConnections],
  );

  return (
    <Stack className="tgph rtk-combobox__grid" gap="3">
      <Text color="gray" size="2" as="div">
        Team
      </Text>
      <MsTeamsTeamCombobox
        team={selectedTeam}
        onTeamChange={setSelectedTeam}
        getChannelCount={getChannelCount}
        queryOptions={teamQueryOptions}
      />
      <Stack
        alignItems="center"
        gap="3"
        minHeight="8"
        style={{ alignSelf: "start" }}
      >
        <Icon color="gray" size="1" icon={Lucide.CornerDownRight} aria-hidden />
        <Text color="gray" size="2" as="div">
          Channel
        </Text>
      </Stack>
      <MsTeamsChannelInTeamCombobox
        teamId={selectedTeam?.id}
        msTeamsChannelsRecipientObject={msTeamsChannelsRecipientObject}
        queryOptions={channelQueryOptions}
      />
      <MsTeamsConnectionError />
    </Stack>
  );
};

export default MsTeamsChannelCombobox;
