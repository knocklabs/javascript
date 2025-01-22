import { MsTeamsChannel, MsTeamsTeam } from "@knocklabs/client";
import { RecipientObject } from "@knocklabs/react-core";
import { FunctionComponent, useState } from "react";

import { CornerDownRightIcon } from "../../../core/components/Icons/CornerDownRightIcon";

import { MsTeamsChannelSelect } from "./MsTeamsChannelSelect";
import { MsTeamsTeamCombobox } from "./MsTeamsTeamCombobox";
import "./styles.css";

interface Props {
  msTeamsChannelsRecipientObject: RecipientObject;
  showConnectedChannelTags: boolean;
}

const MsTeamsChannelCombobox: FunctionComponent<Props> = ({
  msTeamsChannelsRecipientObject,
  showConnectedChannelTags,
}) => {
  const [selection, setSelection] = useState<{
    team?: MsTeamsTeam;
    channels: MsTeamsChannel[];
  }>({
    team: undefined,
    channels: [],
  });

  return (
    <div className="tgph rtk-combobox__grid">
      <div className="rtk-combobox__label">Team</div>
      <MsTeamsTeamCombobox
        team={selection.team}
        onTeamChange={(team) => setSelection({ team, channels: [] })}
      />
      <div className="rtk-combobox__label">
        <CornerDownRightIcon />
        Channel
      </div>
      <MsTeamsChannelSelect
        teamId={selection.team?.id}
        msTeamsChannels={selection.channels}
        onMsTeamsChannelsChange={(channels) =>
          setSelection((selection) => ({
            ...selection,
            channels,
          }))
        }
      />
    </div>
  );
};

export default MsTeamsChannelCombobox;
