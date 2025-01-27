import { useKnockMsTeamsClient, useTranslations } from "@knocklabs/react-core";
import { Icon, Lucide } from "@telegraph/icon";
import { Text } from "@telegraph/typography";
import { FunctionComponent } from "react";

const MsTeamsConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockMsTeamsClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <div className="rtk-combobox__error">
        <span>
          <Icon icon={Lucide.Info} color="black" size="1" aria-hidden />
        </span>
        <Text as="div" color="black" size="1">
          {connectionStatus === "disconnected"
            ? t("msTeamsConnectionErrorOccurred")
            : t("msTeamsConnectionErrorExists")}
        </Text>
      </div>
    );
  }

  return null;
};

export default MsTeamsConnectionError;
