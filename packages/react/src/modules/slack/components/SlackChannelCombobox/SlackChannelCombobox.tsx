import { SlackChannelConnection } from "@knocklabs/client";
import {
  ContainerObject,
  SlackChannelQueryOptions,
  useConnectedSlackChannels,
  useKnockSlackClient,
  useSlackChannels,
} from "@knocklabs/react-core";
import * as Popover from "@radix-ui/react-popover";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFilter } from "react-aria";

import { Spinner, useOutsideClick } from "../../../core";

import SlackAddChannelInput from "./SlackAddChannelInput";
import SlackChannelListBox from "./SlackChannelListBox";
import SlackConnectionError from "./SlackConnectionError";
import SearchIcon from "./icons/SearchIcon";
import "./styles.css";

const DEFAULT_INPUT_MESSAGES = {
  disconnected: "Slack is not connected.",
  multipleChannelsConnected: "Multiple channels connected",
  noChannelsConnected: "Search channels",
  noSlackChannelsFound: "No slack channels.",
  channelsError: "Error fetching channels.",
};

const MAX_ALLOWED_CHANNELS = 1000;

type SlackChannelComboboxInputMessages = {
  disconnected: string;
  error: string;
  singleChannelConnected: string;
  multipleChannelsConnected: string;
  noChannelsConnected: string;
  noSlackChannelsFound: string;
};

type Props = {
  slackChannelsRecipientObject: ContainerObject;
  queryOptions?: SlackChannelQueryOptions;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  inputContainerProps?: React.HTMLAttributes<HTMLDivElement>;
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
  inputMessages?: SlackChannelComboboxInputMessages;
};

export const SlackChannelCombobox = ({
  slackChannelsRecipientObject,
  queryOptions,
  inputProps,
  inputContainerProps,
  listBoxProps,
  channelOptionProps,
  inputMessages,
}: Props) => {
  // Gather API data
  const { connectionStatus, errorLabel: connectionErrorLabel } =
    useKnockSlackClient();

  const { data: slackChannels, isLoading: slackChannelsLoading } =
    useSlackChannels({ queryOptions });

  const {
    data: connectedChannels,
    updateConnectedChannels,
    loading: connectedChannelsLoading,
    error: connectedChannelsError,
    updating: connectedChannelsUpdating,
  } = useConnectedSlackChannels({ slackChannelsRecipientObject });

  const [comboboxListOpen, setComboboxListOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  // Used to close the combobox when clicking outside of it
  const comboboxRef = useRef(null);
  useOutsideClick({ ref: comboboxRef, fn: () => setComboboxListOpen(false) });

  // Used to optimistically show when user toggles a channel connected or not
  const [currentConnectedChannels, setCurrentConnectedChannels] = useState<
    SlackChannelConnection[] | null
  >(null);

  useEffect(() => {
    setCurrentConnectedChannels(connectedChannels);
  }, [connectedChannels]);

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

    const numberConnectedChannels = connectedChannels?.length || 0;

    if (connectedChannels && numberConnectedChannels === 0) {
      return (
        inputMessages?.noChannelsConnected ||
        DEFAULT_INPUT_MESSAGES.noChannelsConnected
      );
    }

    if (connectedChannels && numberConnectedChannels === 1) {
      const connectedChannel = slackChannels?.find(
        (slackChannel) => slackChannel.id === connectedChannels[0]?.channel_id,
      );

      return (
        inputMessages?.singleChannelConnected || `#${connectedChannel?.name}`
      );
    }

    if (connectedChannels && numberConnectedChannels > 1) {
      return (
        inputMessages?.multipleChannelsConnected ||
        `${numberConnectedChannels} channels connected`
      );
    }

    return "";
  }, [
    inLoadingState,
    connectionStatus,
    slackChannels,
    connectedChannels,
    inputMessages,
    connectionErrorLabel,
  ]);

  // Handle channel click
  const handleOptionClick = async (channelId: string) => {
    if (!connectedChannels) {
      return;
    }

    const isChannelConnected = connectedChannels.find(
      (channel) => channel.channel_id === channelId,
    );

    if (isChannelConnected) {
      const channelsToSendToKnock = connectedChannels.filter(
        (connectedChannel) => connectedChannel.channel_id !== channelId,
      );
      setCurrentConnectedChannels(channelsToSendToKnock);
      updateConnectedChannels(channelsToSendToKnock);
    } else {
      const channelsToSendToKnock = [
        ...connectedChannels,
        { channel_id: channelId } as SlackChannelConnection,
      ];
      setCurrentConnectedChannels(channelsToSendToKnock);
      updateConnectedChannels(channelsToSendToKnock);
    }
  };

  // Handle channel search
  const { contains } = useFilter({ sensitivity: "base" });
  const matchedChannels = slackChannels.filter((slackChannel) =>
    contains(slackChannel.name, inputValue),
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
    <div ref={comboboxRef}>
      <Popover.Root
        open={connectionStatus !== "disconnected" ? comboboxListOpen : false}
      >
        <VisuallyHidden.Root>
          <label htmlFor="slack-channel-search">Search channels</label>
        </VisuallyHidden.Root>
        <Popover.Trigger asChild>
          <div className="rnf-trigger-container">
            <div
              className={"rnf-input-icon-container"}
              {...inputContainerProps}
            >
              <div
                className={`rnf-input-icon ${inErrorState && "rnf-input-icon-error"}`}
              >
                {inLoadingState ? (
                  <Spinner size="15px" thickness={3} />
                ) : (
                  <SearchIcon />
                )}
              </div>
              <div>
                <input
                  className={`rnf-input-with-icon ${inErrorState && "rnf-input-with-icon-error"}`}
                  tabIndex={-1}
                  id="slack-channel-search"
                  type="text"
                  onFocus={() => setComboboxListOpen(true)}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={searchPlaceholder || ""}
                  disabled={!!inErrorState}
                  {...inputProps}
                />
              </div>
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
    </div>
  );
};
