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
    channel?: MsTeamsChannel;
  }>({});

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <MsTeamsTeamSelect
        team={selection.team}
        onTeamChange={(team) => setSelection({ team, channel: undefined })}
      />
      <MsTeamsChannelSelect
        teamId={selection.team?.id}
        msTeamsChannel={selection.channel}
        onMsTeamsChannelChange={(channel) =>
          setSelection((prev) => ({ ...prev, channel }))
        }
      />
    </div>
  );
};

export default MsTeamsChannelCombobox;
