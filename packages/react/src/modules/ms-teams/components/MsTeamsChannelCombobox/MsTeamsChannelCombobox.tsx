import { MsTeamsTeam } from "@knocklabs/client";
import { RecipientObject } from "@knocklabs/react-core";
import { FunctionComponent, useState } from "react";

import { MsTeamsTeamSelect } from "./MsTeamsTeamSelect";

interface Props {
  msTeamsChannelsRecipientObject: RecipientObject;
  showConnectedChannelTags: boolean;
}

const MsTeamsChannelCombobox: FunctionComponent<Props> = ({
  msTeamsChannelsRecipientObject,
  showConnectedChannelTags,
}) => {
  const [team, setTeam] = useState<MsTeamsTeam>();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <MsTeamsTeamSelect team={team} onTeamChange={setTeam} />
    </div>
  );
};

export default MsTeamsChannelCombobox;
