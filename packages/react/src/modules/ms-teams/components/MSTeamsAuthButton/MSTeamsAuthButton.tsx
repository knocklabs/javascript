import {
  useKnockClient,
  useMSTeamsAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useEffect, useState } from "react";

import { openPopupWindow } from "../../../core/utils";
import { MSTeamsIcon } from "../MSTeamsIcon";

export interface MSTeamsAuthButtonProps {
  msTeamsBotId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
}

// TODO Move this to KnockMSTeamsProvider
type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

export const MSTeamsAuthButton: FunctionComponent<MSTeamsAuthButtonProps> = ({
  msTeamsBotId,
  redirectUrl,
  onAuthenticationComplete,
}) => {
  const { t } = useTranslations();
  const knock = useKnockClient();

  // TODO: Move this state to KnockMSTeamsProvider
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const { buildMSTeamsAuthUrl } = useMSTeamsAuth(msTeamsBotId, redirectUrl);

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

  // Loading states
  if (connectionStatus === "connecting") {
    return (
      <div className="rsk-connect__button rsk-connect__button--loading">
        <MSTeamsIcon height="16px" width="16px" />
        <span>{t("msTeamsConnecting")}</span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
        className="rsk-connect__button rsk-connect__button--error"
      >
        <MSTeamsIcon height="16px" width="16px" />
        <span className="rsk-connect__button__text--error">
          {t("msTeamsError")}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => openPopupWindow(buildMSTeamsAuthUrl())}
        className="rsk-connect__button rsk-connect__button--disconnected"
      >
        <MSTeamsIcon height="16px" width="16px" />
        <span>{t("msTeamsConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      className="rsk-connect__button rsk-connect__button--connected"
      disabled
    >
      <MSTeamsIcon height="16px" width="16px" />
      <span>{t("msTeamsConnected")}</span>
    </button>
  );
};
