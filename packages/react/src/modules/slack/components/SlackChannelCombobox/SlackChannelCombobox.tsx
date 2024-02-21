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
  const [comboboxListOpen, setComboboxListOpen] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState("");

  // Used to close the combobox when clicking outside of it
  const comboboxRef = useRef(null);
  useOutsideClick({ ref: comboboxRef, fn: () => setComboboxListOpen(false) });

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

  const [currentConnectedChannels, setCurrentConnectedChannels] = useState<
    SlackChannelConnection[] | null
  >(null);

  useEffect(() => {
    // Used to make sure we're only showing currently available channels to select from.
    // There are cases where a channel is "connected" in Knock, but it wouldn't be
    // posting to it if the channel is private and the Slackbot doesn't belong to it,
    // so the channel won't show up here and it won't be posted to.
    const slackChannelsMap = new Map(
      slackChannels.map((channel) => [channel.id, channel]),
    );

    const channels = connectedChannels?.filter((connectedChannel) => {
      return slackChannelsMap.has(connectedChannel.channel_id);
    }) || [];

    setCurrentConnectedChannels(channels);
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
    currentConnectedChannels,
    inputMessages,
    connectionErrorLabel,
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

      setCurrentConnectedChannels(channelsToSendToKnock);
      updateConnectedChannels(channelsToSendToKnock);
    } else {
      const channelsToSendToKnock = [
        ...currentConnectedChannels,
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
