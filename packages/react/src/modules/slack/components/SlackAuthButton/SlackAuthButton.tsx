import {
  useAuthPolling,
  useAuthPostMessageListener,
  useKnockClient,
  useKnockSlackClient,
  useSlackAuth,
  useTranslations,
} from "@knocklabs/react-core";
import { FunctionComponent, useCallback, useMemo } from "react";

import { openPopupWindow } from "../../../core/utils";
import "../../theme.css";
import { SlackIcon } from "../SlackIcon";

import "./styles.css";

export interface SlackAuthButtonProps {
  slackClientId: string;
  redirectUrl?: string;
  onAuthenticationComplete?: (authenticationResp: string) => void;
  // When provided, the default scopes will be overridden with the provided scopes
  scopes?: string[];
  // Additional scopes to add to the default scopes
  additionalScopes?: string[];
}

export const SlackAuthButton: FunctionComponent<SlackAuthButtonProps> = ({
  slackClientId,
  redirectUrl,
  onAuthenticationComplete,
  scopes,
  additionalScopes,
}) => {
  const { t } = useTranslations();
  const knock = useKnockClient();

  const {
    setConnectionStatus,
    connectionStatus,
    setActionLabel,
    actionLabel,
    errorLabel,
    tenantId,
    knockSlackChannelId,
    popupWindowRef,
  } = useKnockSlackClient();

  const useSlackAuthOptions = useMemo(
    () => ({
      scopes,
      additionalScopes,
    }),
    [scopes, additionalScopes],
  );

  const { buildSlackAuthUrl, disconnectFromSlack } = useSlackAuth(
    slackClientId,
    redirectUrl,
    useSlackAuthOptions,
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
      return knock.slack.authCheck({
        tenant: tenantId,
        knockChannelId: knockSlackChannelId,
      });
    }, [knock.slack, tenantId, knockSlackChannelId]),
  });

  const disconnectLabel = t("slackDisconnect") || null;
  const reconnectLabel = t("slackReconnect") || null;

  // Loading states
  if (
    connectionStatus === "connecting" ||
    connectionStatus === "disconnecting"
  ) {
    return (
      <div className="rsk-connect__button rsk-connect__button--loading">
        <SlackIcon height="16px" width="16px" />
        <span>
          {connectionStatus === "connecting"
            ? t("slackConnecting")
            : t("slackDisconnecting")}
        </span>
      </div>
    );
  }

  // Error state
  if (connectionStatus === "error") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildSlackAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rsk-connect__button rsk-connect__button--error"
        onMouseEnter={() => setActionLabel(reconnectLabel)}
        onMouseLeave={() => setActionLabel(null)}
      >
        <SlackIcon height="16px" width="16px" />
        <span className="rsk-connect__button__text--error">
          {actionLabel || errorLabel || t("slackError")}
        </span>
      </button>
    );
  }

  // Disconnected state
  if (connectionStatus === "disconnected") {
    return (
      <button
        onClick={() => {
          const popup = openPopupWindow(buildSlackAuthUrl());
          popupWindowRef.current = popup;
          setConnectionStatus("connecting");
        }}
        className="rsk-connect__button rsk-connect__button--disconnected"
      >
        <SlackIcon height="16px" width="16px" />
        <span>{t("slackConnect")}</span>
      </button>
    );
  }

  // Connected state
  return (
    <button
      onClick={disconnectFromSlack}
      className="rsk-connect__button rsk-connect__button--connected"
      onMouseEnter={() => setActionLabel(disconnectLabel)}
      onMouseLeave={() => setActionLabel(null)}
    >
      <SlackIcon height="16px" width="16px" />
      <span className="rsk-connect__button__text--connected">
        {actionLabel || t("slackConnected")}
      </span>
    </button>
  );
};
