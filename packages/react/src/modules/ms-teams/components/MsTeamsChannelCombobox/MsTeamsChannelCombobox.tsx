import { MsTeamsTeam } from "@knocklabs/client";
import {
  MsTeamsChannelQueryOptions,
  MsTeamsTeamQueryOptions,
  RecipientObject,
  useConnectedMsTeamsChannels,
} from "@knocklabs/react-core";
import { FunctionComponent, useCallback, useState } from "react";

import { CornerDownRightIcon } from "../../../core/components/Icons/CornerDownRightIcon";

import { MsTeamsChannelSelect } from "./MsTeamsChannelSelect";
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
    <div className="tgph rtk-combobox__grid">
      <div className="rtk-combobox__label">Team</div>
      <MsTeamsTeamCombobox
        team={selectedTeam}
        onTeamChange={setSelectedTeam}
        getChannelCount={getChannelCount}
        queryOptions={teamQueryOptions}
      />
      <div className="rtk-combobox__label">
        <CornerDownRightIcon />
        Channel
      </div>
      <MsTeamsChannelSelect
        teamId={selectedTeam?.id}
        msTeamsChannelsRecipientObject={msTeamsChannelsRecipientObject}
        queryOptions={channelQueryOptions}
      />
      <MsTeamsConnectionError />
    </div>
  );
};

export default MsTeamsChannelCombobox;
