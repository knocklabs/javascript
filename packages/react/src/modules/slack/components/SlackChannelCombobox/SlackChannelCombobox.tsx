import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";
import {
  RecipientObject,
  SlackChannelQueryOptions,
  useConnectedSlackChannels,
  useKnockSlackClient,
  useSlackChannels,
  useTranslations,
} from "@knocklabs/react-core";
import * as Popover from "@radix-ui/react-popover";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { Combobox } from "@telegraph/combobox";
import { useCallback, useMemo, useRef, useState } from "react";
import { FunctionComponent } from "react";

import { Spinner } from "../../../core";
import {
  fromLabelSearchableOption,
  sortByName,
  toLabelSearchableOption,
} from "../../../ms-teams/utils";
import "../../theme.css";
import SlackAddChannelInput from "../SlackAddChannelInput/SlackAddChannelInput";

import SlackChannelListBox from "./SlackChannelListBox";
import SlackConnectedChannelTagList from "./SlackConnectedChannelTagList";
import SlackConnectionError from "./SlackConnectionError";
import { strContains } from "./helpers";
import SearchIcon from "./icons/SearchIcon";
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
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
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
  listBoxProps,
  channelOptionProps,
  inputMessages,
  showConnectedChannelTags = false,
}) => {
  const { t } = useTranslations();

  const [comboboxListOpen, setComboboxListOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  // Used to close the combobox when clicking outside of it
  const comboboxRef = useRef(null);

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
      connectedChannelsError,
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

  // Handle channel click
  const handleOptionClick = async (channelId: string) => {
    if (!currentConnectedChannels) {
      return;
    }

    const isChannelConnected = currentConnectedChannels.find(
      (channel) => channel.channel_id === channelId,
    );

    if (isChannelConnected) {
      const channelsToSendToKnock = currentConnectedChannels.filter(
        (connectedChannel) => connectedChannel.channel_id !== channelId,
      );

      updateConnectedChannels(channelsToSendToKnock);
    } else {
      const channelsToSendToKnock = [
        ...currentConnectedChannels,
        { channel_id: channelId } as SlackChannelConnection,
      ];

      updateConnectedChannels(channelsToSendToKnock);
    }
  };

  // Handle channel search
  const matchedChannels = slackChannels.filter((slackChannel) =>
    strContains(slackChannel.name, inputValue),
  );

  const channelToOption = useCallback(
    (channel: SlackChannel) =>
      toLabelSearchableOption({
        value: channel.id,
        label: channel.name,
      }),
    [],
  );

  const comboboxValue = useMemo(
    () =>
      currentConnectedChannels.map((connection) => {
        const channel = slackChannels.find(
          (c) => c.id === connection.channel_id,
        );
        return channel
          ? channelToOption(channel)
          : { label: "Loading…", value: connection.channel_id! };
      }),
    [currentConnectedChannels, slackChannels, channelToOption],
  );

  if (slackChannels.length > MAX_ALLOWED_CHANNELS) {
    return (
      <SlackAddChannelInput
        inErrorState={!!inErrorState}
        connectedChannels={currentConnectedChannels || []}
        updateConnectedChannels={updateConnectedChannels}
        connectedChannelsError={connectedChannelsError}
        connectedChannelsUpdating={connectedChannelsUpdating}
      />
    );
  }

  return (
    <>
      <div className="tgph">
        <Combobox.Root
          value={comboboxValue}
          onValueChange={(searchableOptions) => {
            const options = searchableOptions.map(fromLabelSearchableOption);
            const updatedConnections = options.map<SlackChannelConnection>(
              ({ value: channelId }) => ({
                channel_id: channelId,
              }),
            );

            updateConnectedChannels(updatedConnections).catch(console.error);
          }}
          closeOnSelect={false}
          layout="wrap"
        >
          <Combobox.Trigger />
          <Combobox.Content>
            <Combobox.Search />
            <Combobox.Options>
              {slackChannels.map((channel) => (
                <Combobox.Option
                  key={channel.id}
                  {...channelToOption(channel)}
                />
              ))}
            </Combobox.Options>
          </Combobox.Content>
        </Combobox.Root>
      </div>
      <div ref={comboboxRef} className="rsk-combobox">
        <Popover.Root
          open={connectionStatus !== "disconnected" ? comboboxListOpen : false}
        >
          <VisuallyHidden.Root>
            <label htmlFor="slack-channel-search">
              {t("slackSearchChannels")}
            </label>
          </VisuallyHidden.Root>
          <Popover.Trigger asChild>
            <div className="rsk-combobox__searchbar">
              <div
                className={"rsk-combobox__searchbar__input-container"}
                {...inputContainerProps}
              >
                <div
                  className={`rsk-combobox__searchbar__input-container__icon ${inErrorState && "rsk-combobox__searchbar__input-container__icon--error"}`}
                >
                  {inLoadingState ? (
                    <Spinner size="15px" thickness={3} />
                  ) : (
                    <SearchIcon />
                  )}
                </div>

                <input
                  className={`rsk-combobox__searchbar__input-container__input ${inErrorState ? "rsk-combobox__searchbar__input-container__input--error" : ""}`}
                  tabIndex={-1}
                  id="slack-channel-search"
                  type="text"
                  onFocus={() =>
                    slackChannels.length > 0 && setComboboxListOpen(true)
                  }
                  onChange={(e) => setInputValue(e.target.value)}
                  value={inputValue}
                  placeholder={searchPlaceholder || ""}
                  disabled={!!inErrorState}
                  {...inputProps}
                />
              </div>

              <SlackConnectionError />
            </div>
          </Popover.Trigger>

          <Popover.Content>
            <SlackChannelListBox
              isLoading={slackChannelsLoading || connectedChannelsLoading}
              isUpdating={connectedChannelsUpdating}
              connectedChannels={currentConnectedChannels}
              onClick={handleOptionClick}
              slackChannels={matchedChannels}
              listBoxProps={listBoxProps}
              channelOptionProps={channelOptionProps}
            />
          </Popover.Content>
        </Popover.Root>
        {showConnectedChannelTags && (
          <SlackConnectedChannelTagList
            connectedChannels={currentConnectedChannels}
            slackChannels={slackChannels}
            updateConnectedChannels={handleOptionClick}
          />
        )}
      </div>
    </>
  );
};
