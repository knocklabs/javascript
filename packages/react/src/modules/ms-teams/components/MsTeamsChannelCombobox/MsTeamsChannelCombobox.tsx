import { RecipientObject } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

interface Props {
  msTeamsChannelsRecipientObject: RecipientObject;
  showConnectedChannelTags: boolean;
}

const MsTeamsChannelCombobox: FunctionComponent<Props> = ({
  msTeamsChannelsRecipientObject,
  showConnectedChannelTags,
}) => {
  return <div>MsTeamsChannelCombobox</div>;
};

export default MsTeamsChannelCombobox;
