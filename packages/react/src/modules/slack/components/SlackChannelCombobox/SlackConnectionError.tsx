import { useKnockSlackClient, useTranslations } from "@knocklabs/react-core";
import { FunctionComponent } from "react";

import SlackErrorMessage from "./SlackErrorMessage";

const SlackConnectionError: FunctionComponent = () => {
  const { t } = useTranslations();
  const { connectionStatus } = useKnockSlackClient();

  if (connectionStatus === "disconnected" || connectionStatus === "error") {
    return (
      <SlackErrorMessage
        message={
          connectionStatus === "disconnected"
            ? t("slackConnectionErrorOccurred")
            : t("slackConnectionErrorExists")
        }
      />
    );
  }

  return null;
};

export default SlackConnectionError;
