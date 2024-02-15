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

import { useOutsideClick } from "../../../core";

import SlackChannelListBox from "./SlackChannelListBox";
import InfoIcon from "./icons/InfoIcon";
import SearchIcon from "./icons/SearchIcon";
import "./styles.css";

const DEFAULT_INPUT_MESSAGES = {
  connecting: "Connecting to Slack...",
  disconnecting: "Disconnecting...",
  channelsLoading: "Fetching channels...",
  disconnected: "Slack is not connected.",
  multipleChannelsConnected: "Multiple channels connected",
  noChannelsConnected: "Search channels",
  noSlackChannelsFound: "No slack channels.",
  channelsError: "Error fetching channels.",
};

type SlackChannelComboboxInputMessages = {
  connecting: string;
  channelsLoading: string;
  disconnected: string;
  disconnecting: string;
  error: string;
  singleChannelConnected: string;
  multipleChannelsConnected: string;
  noChannelsConnected: string;
  noSlackChannelsFound: string;
};

type Props = {
  connectionsObject: ContainerObject;
  queryOptions?: SlackChannelQueryOptions;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  inputContainerProps?: React.HTMLAttributes<HTMLDivElement>;
  listBoxProps?: React.HTMLAttributes<HTMLDivElement>;
  channelOptionProps?: React.HtmlHTMLAttributes<HTMLButtonElement>;
  inputMessages?: SlackChannelComboboxInputMessages;
};

export const SlackChannelCombobox = ({
  connectionsObject,
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
  } = useConnectedSlackChannels({ connectionsObject });

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

  // Construct placeholder text
  const searchPlaceholder = useMemo(() => {
    // Connection status messages
    if (connectionStatus === "connecting") {
      return inputMessages?.connecting || DEFAULT_INPUT_MESSAGES.connecting;
    }

    if (connectionStatus === "disconnecting") {
      return (
        inputMessages?.disconnecting || DEFAULT_INPUT_MESSAGES.disconnecting
      );
    }

    if (connectionStatus === "disconnected") {
      return inputMessages?.disconnected || DEFAULT_INPUT_MESSAGES.disconnected;
    }

    if (connectionStatus === "error") {
      return inputMessages?.error || connectionErrorLabel;
    }

    if (connectedChannelsError) {
      return inputMessages?.error || DEFAULT_INPUT_MESSAGES.channelsError;
    }

    // Channel messages
    if (slackChannelsLoading || connectedChannelsLoading) {
      return (
        inputMessages?.channelsLoading || DEFAULT_INPUT_MESSAGES.channelsLoading
      );
    }

    if (slackChannels.length === 0) {
      return (
        inputMessages?.noSlackChannelsFound ||
        DEFAULT_INPUT_MESSAGES.noSlackChannelsFound
      );
    }

    const numberConnectedChannels = connectedChannels?.length;

    if (numberConnectedChannels === 0 || !connectedChannels) {
      return (
        inputMessages?.noChannelsConnected ||
        DEFAULT_INPUT_MESSAGES.noChannelsConnected
      );
    }

    if (numberConnectedChannels === 1) {
      const connectedChannel = slackChannels?.find(
        (slackChannel) => slackChannel.id === connectedChannels[0]?.channel_id,
      );

      return (
        inputMessages?.singleChannelConnected || `#${connectedChannel?.name}`
      );
    }

    return (
      inputMessages?.multipleChannelsConnected || "Multiple channels connected"
    );
  }, [
    connectionStatus,
    connectedChannelsError,
    slackChannelsLoading,
    connectedChannelsLoading,
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

  const isErrorState = useMemo(
    () =>
      connectionStatus === "disconnected" ||
      connectionStatus === "error" ||
      connectedChannelsError,
    [connectedChannelsError, connectionStatus],
  );

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
              <span
                className={`rnf-input-icon ${isErrorState && "rnf-input-icon-error"}`}
              >
                <SearchIcon />
              </span>

              <input
                className={`rnf-input-with-icon ${isErrorState && "rnf-input-with-icon-error"}`}
                tabIndex={-1}
                id="slack-channel-search"
                type="text"
                onFocus={() => setComboboxListOpen(true)}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={searchPlaceholder || "Search channels"}
                disabled={
                  connectionStatus === "disconnected" ||
                  connectionStatus === "error" ||
                  !!connectedChannelsError
                }
                {...inputProps}
              />
            </div>
            {connectionStatus === "disconnected" && (
              <div className="rnf-disconnected-info-container">
                <span>
                  <InfoIcon />
                </span>

                <div className="rnf-info-container-text">
                  Try reconnecting to Slack to find and select channels from
                  your workspace.
                </div>
              </div>
            )}

            {connectionStatus === "error" && (
              <div className="rnf-disconnected-info-container">
                <span>
                  <InfoIcon />
                </span>

                <div className="rnf-info-container-text">
                  There was an error connecting to Slack. Try reconnecting to
                  find and select channels from your workspace.
                </div>
              </div>
            )}

            {connectedChannelsError && (
              <div className="rnf-disconnected-info-container">
                <span>
                  <InfoIcon />
                </span>

                <div className="rnf-info-container-text">
                  There was an error fetching Slack channels. Try disconnecting
                  and reconnecting to find and select channels from your
                  workspace.
                </div>
              </div>
            )}
          </div>
        </Popover.Trigger>

        <Popover.Content>
          <SlackChannelListBox
            isLoading={slackChannelsLoading || connectedChannelsLoading}
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
