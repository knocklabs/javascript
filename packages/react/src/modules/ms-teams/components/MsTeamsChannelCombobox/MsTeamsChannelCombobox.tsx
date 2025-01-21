import { MsTeamsChannel, MsTeamsTeam } from "@knocklabs/client";
import { RecipientObject } from "@knocklabs/react-core";
import { FunctionComponent, useState } from "react";

import { MsTeamsChannelSelect } from "./MsTeamsChannelSelect";
import { MsTeamsTeamSelect } from "./MsTeamsTeamSelect";

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

  console.log(selection);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <MsTeamsTeamSelect
        team={selection.team}
        onTeamChange={(team) => setSelection({ team, channels: [] })}
      />
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
