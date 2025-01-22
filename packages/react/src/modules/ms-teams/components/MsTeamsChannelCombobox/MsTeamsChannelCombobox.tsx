import { MsTeamsTeam } from "@knocklabs/client";
import { RecipientObject } from "@knocklabs/react-core";
import { FunctionComponent, useState } from "react";

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

  return (
    <div className="tgph rtk-combobox__grid">
      <div className="rtk-combobox__label">Team</div>
      <MsTeamsTeamCombobox
        team={selectedTeam}
        onTeamChange={setSelectedTeam}
        getChannelCount={() => 12}
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
