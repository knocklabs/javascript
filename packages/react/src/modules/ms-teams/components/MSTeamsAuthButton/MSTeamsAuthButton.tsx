import {
  useKnockClient,
  useKnockMSTeamsClient,
  useMSTeamsAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useEffect } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { MSTeamsIcon } from "../MSTeamsIcon";

import "./styles.css";

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
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
  } = useKnockMSTeamsClient();

  const { buildMSTeamsAuthUrl, disconnectFromMSTeams } = useMSTeamsAuth(
    msTeamsBotId,
    redirectUrl,
  );

  useEffect(() => {
    const receiveMessage = (event: MessageEvent) => {
      if (event.origin !== knock.host) {
        return;
      }

      try {
        if (event.data === "authComplete") {
          setConnectionStatus("connected");
        }

        if (event.data === "authFailed") {
          setConnectionStatus("error");
        }

        if (onAuthenticationComplete) {
          onAuthenticationComplete(event.data);
        }
      } catch (_error) {
        setConnectionStatus("error");
      }
    };

    window.addEventListener("message", receiveMessage, false);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [knock.host, onAuthenticationComplete, setConnectionStatus]);

  const disconnectLabel = t("msTeamsDisconnect") || null;
  const reconnectLabel = t("msTeamsReconnect") || null;

  // Loading states
  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnecting"
  ) {
    return (
      <div className="rtk-connect__button rtk-connect__button--loading">
        <MSTeamsIcon height="16px" width="16px" />
        <span>
          {connectionStatus === "connecting"
            ? t("msTeamsConnecting")
            : t("msTeamsDisconnecting")}
        </span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
        className="rtk-connect__button rtk-connect__button--error"
        onMouseEnter={() => setActionLabel(reconnectLabel)}
        onMouseLeave={() => setActionLabel(null)}
      >
        <MSTeamsIcon height="16px" width="16px" />
        <span className="rtk-connect__button__text--error">
          {actionLabel || errorLabel || t("msTeamsError")}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
        className="rtk-connect__button rtk-connect__button--disconnected"
      >
        <MSTeamsIcon height="16px" width="16px" />
        <span>{t("msTeamsConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromMSTeams}
      className="rtk-connect__button rtk-connect__button--connected"
      onMouseEnter={() => setActionLabel(disconnectLabel)}
      onMouseLeave={() => setActionLabel(null)}
    >
      <MSTeamsIcon height="16px" width="16px" />
      <span className="rtk-connect__button__text--connected">
        {actionLabel || t("msTeamsConnected")}
      </span>
    </button>
  );
};
