import {
  useAuthPolling,
  useAuthPostMessageListener,
  useKnockClient,
  useKnockMsTeamsClient,
  useMsTeamsAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useCallback } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { MsTeamsIcon } from "../MsTeamsIcon";

import "./styles.css";

export type MsTeamsAuthButtonProps = {
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
} & (
  | {
      /**
       * The client ID of your Microsoft Graph API-enabled application registered with Microsoft Entra. This should
       * match the "Graph API client ID" setting of your Microsoft Teams channel in the Knock dashboard.
       */
      graphApiClientId: string;
    }
  | {
      /**
       * @deprecated Use `graphApiClientId` instead. This field will be removed in a future release.
       */
      msTeamsBotId: string;
    }
);

export const MsTeamsAuthButton: FunctionComponent<MsTeamsAuthButtonProps> = ({
  redirectUrl,
  onAuthenticationComplete,
  ...props
}) => {
  const graphApiClientId =
    "graphApiClientId" in props ? props.graphApiClientId : props.msTeamsBotId;

  const { t } = useTranslations();
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
    tenantId,
    knockMsTeamsChannelId,
    popupWindowRef,
  } = useKnockMsTeamsClient();

  const { buildMsTeamsAuthUrl, disconnectFromMsTeams } = useMsTeamsAuth(
    graphApiClientId,
    redirectUrl,
  );

  useAuthPostMessageListener({
    knockHost: knock.host,
    popupWindowRef,
    setConnectionStatus,
    onAuthenticationComplete,
  });

  useAuthPolling({
    popupWindowRef,
    setConnectionStatus,
    onAuthenticationComplete,
    authCheckFn: useCallback(async () => {
      return knock.msTeams.authCheck({
        tenant: tenantId,
        knockChannelId: knockMsTeamsChannelId,
      });
    }, [knock.msTeams, tenantId, knockMsTeamsChannelId]),
  });

  const disconnectLabel = t("msTeamsDisconnect") || null;
  const reconnectLabel = t("msTeamsReconnect") || null;

  // Loading states
  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnecting"
  ) {
    return (
      <div className="rtk-connect__button rtk-connect__button--loading">
        <MsTeamsIcon height="16px" width="16px" />
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
        onClick={() => {
          const popup = openPopupWindow(buildMsTeamsAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rtk-connect__button rtk-connect__button--error"
        onMouseEnter={() => setActionLabel(reconnectLabel)}
        onMouseLeave={() => setActionLabel(null)}
      >
        <MsTeamsIcon height="16px" width="16px" />
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
        onClick={() => {
          const popup = openPopupWindow(buildMsTeamsAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rtk-connect__button rtk-connect__button--disconnected"
      >
        <MsTeamsIcon height="16px" width="16px" />
        <span>{t("msTeamsConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromMsTeams}
      className="rtk-connect__button rtk-connect__button--connected"
      onMouseEnter={() => setActionLabel(disconnectLabel)}
      onMouseLeave={() => setActionLabel(null)}
    >
      <MsTeamsIcon height="16px" width="16px" />
      <span className="rtk-connect__button__text--connected">
        {actionLabel || t("msTeamsConnected")}
      </span>
    </button>
  );
};
