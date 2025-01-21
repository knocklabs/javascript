import { useKnockMsTeamsClient, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import InfoIcon from "../../../core/icons/InfoIcon";

const MsTeamsConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockMsTeamsClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rtk-combobox__error">
        <span>
          <InfoIcon />
        </span>

        <div className="rtk-combobox__error__text">
          {connectionStatus === "disconnected"
            ? t("msTeamsConnectionErrorOccurred")
            : t("msTeamsConnectionErrorExists")}
        </div>
      </div>
    );
  }

  return null;
};

export default MsTeamsConnectionError;
