import { MsTeamsChannel, MsTeamsTeam } from "@knocklabs/client";
import { FunctionComponent } from "react";

import { ChevronRight } from "../../../core/components/Icons";
import CloseIcon from "../../../core/icons/CloseIcon";

import "./styles.css";

interface MsTeamsConnectedChannelTagProps {
  team: MsTeamsTeam;
  channel: MsTeamsChannel;
  updateConnectedChannels: (teamId: string, channelId: string) => void;
}

const MsTeamsConnectedChannelTag: FunctionComponent<
  MsTeamsConnectedChannelTagProps
> = ({ team, channel, updateConnectedChannels }) => {
  return (
    <div className="rtk-combobox__connected_channel_tag">
      <div className="rtk-combobox__connected_channel_tag__text">
        {team.displayName}
      </div>
      <div className="rtk-combobox__connected_channel_tag__chevron">
        <ChevronRight />
      </div>
      <div className="rtk-combobox__connected_channel_tag__text">
        {channel.displayName}
      </div>
      <button
        onClick={() => updateConnectedChannels(team.id!, channel.id!)}
        className="rtk-combobox__connected_channel_tag__delete_button"
      >
        <CloseIcon />
      </button>
    </div>
  );
};

export default MsTeamsConnectedChannelTag;
