import { MsTeamsTeam } from "@knocklabs/client";
import {
  RecipientObject,
  useConnectedMsTeamsChannels,
} from "@knocklabs/react-core";
import { FunctionComponent, useCallback, useState } from "react";

import { CornerDownRightIcon } from "../../../core/components/Icons/CornerDownRightIcon";

import { MsTeamsChannelSelect } from "./MsTeamsChannelSelect";
import { MsTeamsTeamCombobox } from "./MsTeamsTeamCombobox";
import "./styles.css";

interface Props {
  msTeamsChannelsRecipientObject: RecipientObject;
}

const MsTeamsChannelCombobox: FunctionComponent<Props> = ({
  msTeamsChannelsRecipientObject,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<MsTeamsTeam | null>(null);

  const { data: currentConnections } = useConnectedMsTeamsChannels({
    msTeamsChannelsRecipientObject,
  });

  // TODO: This doesn't fully work because MsTeamsChannelSelect uses its own useConnectedMsTeamsChannels hook
  const getChannelCount = useCallback(
    (teamId: string) =>
      currentConnections?.filter(
        (connection) => connection.ms_teams_team_id === teamId,
      ).length ?? 0,
    [currentConnections],
  );

  return (
    <div className="rtk-combobox__grid">
      <div className="rtk-combobox__label">Team</div>
      <MsTeamsTeamCombobox
        team={selectedTeam}
        onTeamChange={setSelectedTeam}
        getChannelCount={getChannelCount}
      />
      <div className="rtk-combobox__label">
        <CornerDownRightIcon />
        Channel
      </div>
      <MsTeamsChannelSelect
        teamId={selectedTeam?.id}
        msTeamsChannelsRecipientObject={msTeamsChannelsRecipientObject}
      />
    </div>
  );
};

export default MsTeamsChannelCombobox;
