import { useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import "../../theme.css";
import { MSTeamsIcon } from "../MSTeamsIcon";

import "./styles.css";

export interface MSTeamsAuthContainerProps {
  actionButton: React.ReactElement;
}

export const MSTeamsAuthContainer: FunctionComponent<
  MSTeamsAuthContainerProps
> = ({ actionButton }) => {
  const { t } = useTranslations();

  return (
    <div className="rtk-auth">
      <div className="rtk-auth__header">
        <MSTeamsIcon height="32px" width="32px" />
        <div>{actionButton}</div>
      </div>
      <div className="rtk-auth__title">Microsoft Teams</div>
      <div className="rtk-auth__description">
        {t("msTeamsConnectContainerDescription")}
      </div>
    </div>
  );
};
