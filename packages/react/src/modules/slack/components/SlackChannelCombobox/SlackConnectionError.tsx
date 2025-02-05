import { useKnockSlackClient, useTranslations } from "@knocklabs/react-core";
import { Icon, Lucide } from "@telegraph/icon";
import { FunctionComponent } from "react";

const SlackConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockSlackClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rsk-combobox__error">
        <span>
          <Icon icon={Lucide.Info} color="black" size="1" aria-hidden />
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
