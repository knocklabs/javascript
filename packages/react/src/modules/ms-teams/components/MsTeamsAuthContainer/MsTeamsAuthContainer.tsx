import { useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import "../../theme.css";
import { MsTeamsIcon } from "../MsTeamsIcon";

import "./styles.css";

export interface MsTeamsAuthContainerProps {
  actionButton: React.ReactElement;
}

export const MsTeamsAuthContainer: FunctionComponent<
  MsTeamsAuthContainerProps
> = ({ actionButton }) => {
  const { t } = useTranslations();

  return (
    <div className="rtk-auth">
      <div className="rtk-auth__header">
        <MsTeamsIcon height="32px" width="32px" />
        <div>{actionButton}</div>
      </div>
      <div className="rtk-auth__title">Microsoft Teams</div>
      <div className="rtk-auth__description">
        {t("msTeamsConnectContainerDescription")}
      </div>
    </div>
  );
};
