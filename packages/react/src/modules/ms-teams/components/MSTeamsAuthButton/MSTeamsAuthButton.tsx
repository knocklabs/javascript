import { useMSTeamsAuth } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import { SlackIcon } from "../../../slack/components/SlackIcon";

export interface MSTeamsAuthButtonProps {
  msTeamsBotId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
}

// TODO Consolidate
const openMSTeamsOauthPopup = (url: string) => {
  const width = 600;
  const height = 800;
  // Calculate the position to center the window
  const screenLeft = window.screenLeft ?? window.screenX;
  const screenTop = window.screenTop ?? window.screenY;

  const innerWidth =
    window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const innerHeight =
    window.innerHeight ??
    document.documentElement.clientHeight ??
    screen.height;

  const left = innerWidth / 2 - width / 2 + screenLeft;
  const top = innerHeight / 2 - height / 2 + screenTop;

  // Window features
  const features = `width=${width},height=${height},top=${top},left=${left}`;

  window.open(url, "MS Teams OAuth", features);
};

export const MSTeamsAuthButton: FunctionComponent<MSTeamsAuthButtonProps> = ({
  msTeamsBotId,
  redirectUrl,
  onAuthenticationComplete,
}) => {
  const { buildMSTeamsAuthUrl } = useMSTeamsAuth(msTeamsBotId, redirectUrl);

  return (
    <button
      onClick={() => openMSTeamsOauthPopup(buildMSTeamsAuthUrl())}
      className="rsk-connect__button rsk-connect__button--disconnected"
    >
      <SlackIcon height="16px" width="16px" />
      <span>Connect</span>
    </button>
  );
};
