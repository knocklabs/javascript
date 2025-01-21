import { useKnockSlackClient, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import InfoIcon from "../../../core/icons/InfoIcon";

const SlackConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockSlackClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rsk-combobox__error">
        <span>
          <InfoIcon />
        </span>

        <div className="rsk-combobox__error__text">
          {connectionStatus === "disconnected"
            ? t("slackConnectionErrorOccurred")
            : t("slackConnectionErrorExists")}
        </div>
      </div>
    );
  }

  return null;
};

export default SlackConnectionError;
