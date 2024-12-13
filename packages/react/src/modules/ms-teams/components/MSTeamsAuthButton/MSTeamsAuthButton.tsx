import { useMSTeamsAuth, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import { openPopupWindow } from "../../../core/utils";
import { MSTeamsIcon } from "../MSTeamsIcon";

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
  const { t } = useTranslations();
  const { buildMSTeamsAuthUrl } = useMSTeamsAuth(msTeamsBotId, redirectUrl);

  return (
    <button
      onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
      className="rsk-connect__button rsk-connect__button--disconnected"
    >
      <MSTeamsIcon height="16px" width="16px" />
      <span>{t("msTeamsConnect")}</span>
    </button>
  );
};
