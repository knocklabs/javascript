import { useKnockSlackClient, useTranslations } from "@knocklabs/react-core";
import { Icon, Lucide } from "@telegraph/icon";
import { Text } from "@telegraph/typography";
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

        <Text as="div" color="black" size="1">
          {connectionStatus === "disconnected"
            ? t("slackConnectionErrorOccurred")
            : t("slackConnectionErrorExists")}
        </Text>
      </div>
    );
  }

  return null;
};

export default SlackConnectionError;
