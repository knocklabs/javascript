import { SlackChannelConnection } from "@knocklabs/client";
import {
  RecipientObject,
  SlackChannelQueryOptions,
  useConnectedSlackChannels,
  useKnockSlackClient,
  useSlackChannels,
  useTranslations,
} from "@knocklabs/react-core";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Combobox } from "@telegraph/combobox";
import { Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { useMemo, useState } from "react";
import { FunctionComponent } from "react";

import { Spinner } from "../../../core";
import { sortByName } from "../../../ms-teams/utils";
import "../../theme.css";
import SlackAddChannelInput from "../SlackAddChannelInput/SlackAddChannelInput";

import SlackConnectionError from "./SlackConnectionError";
import HashtagIcon from "./icons/HashtagIcon";
import LockIcon from "./icons/LockIcon";
import "./styles.css";

const MAX_ALLOWED_CHANNELS = 1000;

export type SlackChannelComboboxInputMessages = {
  disconnected: string;
  error: string;
  singleChannelConnected: string;
  multipleChannelsConnected: string;
  noChannelsConnected: string;
  noSlackChannelsFound: string;
};

export interface SlackChannelComboboxProps {
  slackChannelsRecipientObject: RecipientObject;
  queryOptions?: SlackChannelQueryOptions;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  inputContainerProps?: React.HTMLAttributes<HTMLDivElement>;
  inputMessages?: SlackChannelComboboxInputMessages;
  showConnectedChannelTags?: boolean;
}

export const SlackChannelCombobox: FunctionComponent<
  SlackChannelComboboxProps
> = ({
  slackChannelsRecipientObject,
  queryOptions,
  inputProps,
  inputContainerProps,
  inputMessages,
  showConnectedChannelTags = false,
}) => {
  const { t } = useTranslations();

  const [inputValue, setInputValue] = useState("");

  // Gather API data
  const { connectionStatus, errorLabel: connectionErrorLabel } =
    useKnockSlackClient();

  const { data: origChannels, isLoading: slackChannelsLoading } =
    useSlackChannels({ queryOptions });

  const slackChannels = useMemo(() => sortByName(origChannels), [origChannels]);

  const {
    data: connectedChannels,
    updateConnectedChannels,
    loading: connectedChannelsLoading,
    error: connectedChannelsError,
    updating: connectedChannelsUpdating,
  } = useConnectedSlackChannels({ slackChannelsRecipientObject });

  const currentConnectedChannels = useMemo<SlackChannelConnection[]>(() => {
    // Used to make sure we're only showing currently available channels to select from.
    // There are cases where a channel is "connected" in Knock, but it wouldn't be
    // posting to it if the channel is private and the Slackbot doesn't belong to it,
    // so the channel won't show up here and it won't be posted to.
    const slackChannelsMap = new Map(
      slackChannels.map((channel) => [channel.id, channel]),
    );

    return (
      connectedChannels?.filter((connectedChannel) => {
        return slackChannelsMap.has(connectedChannel.channel_id || "");
      }) || []
    );
  }, [connectedChannels, slackChannels]);

  const inErrorState = useMemo(
    () =>
      connectionStatus === "disconnected" ||
      connectionStatus === "error" ||
      connectedChannelsError !== null,
    [connectedChannelsError, connectionStatus],
  );

  const inLoadingState = useMemo(
    () =>
      connectionStatus === "connecting" ||
      connectionStatus === "disconnecting" ||
      slackChannelsLoading,

    [connectionStatus, slackChannelsLoading],
  );

  // Construct placeholder text
  const searchPlaceholder = useMemo(() => {
    const DEFAULT_INPUT_MESSAGES = {
      disconnected: t("slackSearchbarDisconnected"),
      multipleChannelsConnected: t("slackSearchbarMultipleChannels"),
      noChannelsConnected: t("slackSearchbarNoChannelsConnected"),
      noSlackChannelsFound: t("slackSearchbarNoChannelsFound"),
      channelsError: t("slackSearchbarChannelsError"),
    };

    // Connection status message
    if (connectionStatus === "disconnected") {
      return inputMessages?.disconnected || DEFAULT_INPUT_MESSAGES.disconnected;
    }

    if (connectionStatus === "error") {
      return inputMessages?.error || connectionErrorLabel;
    }

    // Channels status messages
    if (!inLoadingState && slackChannels.length === 0) {
      return (
        inputMessages?.noSlackChannelsFound ||
        DEFAULT_INPUT_MESSAGES.noSlackChannelsFound
      );
    }

    if (connectedChannelsError) {
      return connectedChannelsError;
    }

    const numberConnectedChannels = currentConnectedChannels?.length || 0;

    if (currentConnectedChannels && numberConnectedChannels === 0) {
      return (
        inputMessages?.noChannelsConnected ||
        DEFAULT_INPUT_MESSAGES.noChannelsConnected
      );
    }

    if (currentConnectedChannels && numberConnectedChannels === 1) {
      const connectedChannel = slackChannels?.find(
        (slackChannel) =>
          slackChannel.id === currentConnectedChannels[0]?.channel_id,
      );

      return (
        inputMessages?.singleChannelConnected || `# ${connectedChannel?.name}`
      );
    }

    if (currentConnectedChannels && numberConnectedChannels > 1) {
      return (
        inputMessages?.multipleChannelsConnected ||
        `${numberConnectedChannels} channels connected`
      );
    }

    return "";
  }, [
    connectionStatus,
    inLoadingState,
    slackChannels,
    connectedChannelsError,
    currentConnectedChannels,
    inputMessages,
    connectionErrorLabel,
    t,
  ]);

  const comboboxValue = useMemo(
    () => currentConnectedChannels.map((connection) => connection.channel_id),
    [currentConnectedChannels],
  );

  if (slackChannels.length > MAX_ALLOWED_CHANNELS) {
    return (
      <SlackAddChannelInput
        inErrorState={inErrorState}
        connectedChannels={currentConnectedChannels || []}
        updateConnectedChannels={updateConnectedChannels}
        connectedChannelsError={connectedChannelsError}
        connectedChannelsUpdating={connectedChannelsUpdating}
      />
    );
  }

  return (
    <>
      <Stack className="tgph rsk-combobox__grid" gap="3">
        <Text color="gray" size="2" as="div" style={{ alignSelf: "start" }}>
          Channel
        </Text>
        <Combobox.Root
          value={comboboxValue}
          onValueChange={(channelIds) => {
            const updatedConnections = channelIds.map<SlackChannelConnection>(
              (channelId) => ({
                channel_id: channelId,
              }),
            );

            updateConnectedChannels(updatedConnections).catch(console.error);
          }}
          placeholder={searchPlaceholder ?? ""}
          disabled={inErrorState}
          closeOnSelect={false}
          layout="wrap"
        >
          <Combobox.Trigger />
          <Combobox.Content>
            <Combobox.Search className="rsk-combobox__search" />
            <Combobox.Options className="rsk-combobox__options">
              {slackChannels.map((channel) => (
                <Combobox.Option key={channel.id} value={channel.id}>
                  <span aria-hidden>
                    {channel.is_private ? <LockIcon /> : <HashtagIcon />}
                  </span>
                  {channel.name}
                </Combobox.Option>
              ))}
            </Combobox.Options>
            <Combobox.Empty />
          </Combobox.Content>
        </Combobox.Root>
        <SlackConnectionError />
      </Stack>
      <div className="rsk-combobox">
        <VisuallyHidden.Root>
          <label htmlFor="slack-channel-search">
            {t("slackSearchChannels")}
          </label>
        </VisuallyHidden.Root>
        <div className="rsk-combobox__searchbar">
          <div
            className={"rsk-combobox__searchbar__input-container"}
            {...inputContainerProps}
          >
            <div
              className={`rsk-combobox__searchbar__input-container__icon ${inErrorState && "rsk-combobox__searchbar__input-container__icon--error"}`}
            >
              {inLoadingState && <Spinner size="15px" thickness={3} />}
            </div>

            <input
              className={`rsk-combobox__searchbar__input-container__input ${inErrorState ? "rsk-combobox__searchbar__input-container__input--error" : ""}`}
              tabIndex={-1}
              id="slack-channel-search"
              type="text"
              onChange={(e) => setInputValue(e.target.value)}
              value={inputValue}
              placeholder={searchPlaceholder || ""}
              disabled={inErrorState}
              {...inputProps}
            />
          </div>
        </div>
      </div>
    </>
  );
};
