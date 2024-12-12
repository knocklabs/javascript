import { useMSTeamsAuth } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import { openPopupWindow } from "../../../core/utils";
import { SlackIcon } from "../../../slack/components/SlackIcon";

export interface MSTeamsAuthButtonProps {
  msTeamsBotId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
}

export const MSTeamsAuthButton: FunctionComponent<MSTeamsAuthButtonProps> = ({
  msTeamsBotId,
  redirectUrl,
  onAuthenticationComplete,
}) => {
  const { buildMSTeamsAuthUrl } = useMSTeamsAuth(msTeamsBotId, redirectUrl);

  return (
    <button
      onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
      className="rsk-connect__button rsk-connect__button--disconnected"
    >
      <SlackIcon height="16px" width="16px" />
      <span>Connect</span>
    </button>
  );
};
