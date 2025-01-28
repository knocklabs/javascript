import { useKnockMsTeamsClient, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import MsTeamsErrorMessage from "./MsTeamsErrorMessage";

const MsTeamsConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockMsTeamsClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <MsTeamsErrorMessage
        message={
          connectionStatus === "disconnected"
            ? t("msTeamsConnectionErrorOccurred")
            : t("msTeamsConnectionErrorExists")
        }
      />
    );
  }

  return null;
};

export default MsTeamsConnectionError;
