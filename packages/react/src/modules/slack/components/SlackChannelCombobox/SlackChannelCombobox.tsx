import { SlackChannelConnection } from "@knocklabs/client";
import {
  RecipientObject,
  SlackChannelQueryOptions,
  useConnectedSlackChannels,
  useKnockSlackClient,
  useSlackChannels,
  useTranslations,
} from "@knocklabs/react-core";
import { Combobox } from "@telegraph/combobox";
import { Icon } from "@telegraph/icon";
import { Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { Hash, Lock } from "lucide-react";
import { useMemo } from "react";
import { FunctionComponent } from "react";

import "../../theme.css";
import { sortSlackChannelsAlphabetically } from "../../utils";
import SlackAddChannelInput from "../SlackAddChannelInput/SlackAddChannelInput";

import SlackConnectionError from "./SlackConnectionError";
import SlackErrorMessage from "./SlackErrorMessage";
import "./styles.css";

const MAX_ALLOWED_CHANNELS = 1000;

export type SlackChannelComboboxInputMessages = {
  disconnected: string;
  error: string;
  noChannelsConnected: string;
  noSlackChannelsFound: string;
};

export interface SlackChannelComboboxProps {
  slackChannelsRecipientObject: RecipientObject;
  queryOptions?: SlackChannelQueryOptions;
  inputMessages?: SlackChannelComboboxInputMessages;
}

export const SlackChannelCombobox: FunctionComponent<
  SlackChannelComboboxProps
> = ({ slackChannelsRecipientObject, queryOptions, inputMessages }) => {
  const { t } = useTranslations();

  // Gather API data
  const { connectionStatus, errorLabel: connectionErrorLabel } =
    useKnockSlackClient();

  const { data: unsortedSlackChannels, isLoading: slackChannelsLoading } =
    useSlackChannels({ queryOptions });

  const slackChannels = useMemo(
    () => sortSlackChannelsAlphabetically(unsortedSlackChannels),
    [unsortedSlackChannels],
  );

  const {
    data: connectedChannels,
    updateConnectedChannels,
    error: connectedChannelsError,
    updating: connectedChannelsUpdating,
  } = useConnectedSlackChannels({ slackChannelsRecipientObject });

  const slackChannelsById = useMemo(
    () => new Map(slackChannels.map((channel) => [channel.id, channel])),
    [slackChannels],
  );

  const currentConnectedChannels = useMemo<SlackChannelConnection[]>(
    () =>
      // Used to make sure we're only showing currently available channels to select from.
      // There are cases where a channel is "connected" in Knock, but it wouldn't be
      // posting to it if the channel is private and the Slackbot doesn't belong to it,
      // so the channel won't show up here and it won't be posted to.
      connectedChannels?.filter((connectedChannel) =>
        slackChannelsById.has(connectedChannel.channel_id || ""),
      ) || [],
    [connectedChannels, slackChannelsById],
  );

  const inErrorState = useMemo(
    () =>
      connectionStatus === "disconnected" ||
      connectionStatus === "error" ||
      !!connectedChannelsError,
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

    const numberConnectedChannels = currentConnectedChannels?.length || 0;

    if (currentConnectedChannels && numberConnectedChannels === 0) {
      return (
        inputMessages?.noChannelsConnected ||
        DEFAULT_INPUT_MESSAGES.noChannelsConnected
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
    t,
  ]);

  const comboboxValue = useMemo(
    () =>
      currentConnectedChannels
        .map((connection) => connection.channel_id)
        .filter((channelId): channelId is string => !!channelId),
    [currentConnectedChannels],
  );

  // An option's accessible name is derived from its children, and ours are
  // elements (an icon beside the name), so the combobox falls back to the raw
  // channel id. Name the trigger ourselves rather than flattening the option
  // to a bare string, which would cost the icon.
  const triggerLabel = useMemo(() => {
    const connectedNames = comboboxValue
      .map((channelId) => slackChannelsById.get(channelId)?.name)
      .filter((name): name is string => !!name);

    // Falling back to the placeholder matches what the combobox would have
    // named the trigger on its own. It has to stay a string: the trigger
    // spreads our props over its own `aria-label`, so undefined would leave
    // the trigger unnamed rather than deferring.
    return connectedNames.join(", ") || searchPlaceholder || "";
  }, [slackChannelsById, comboboxValue, searchPlaceholder]);

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
    <Stack className="tgph rsk-combobox__grid" gap="3">
      <Text
        color="gray"
        size="2"
        as="div"
        minHeight="8"
        className="rsk-combobox__label"
      >
        Channels
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
        disabled={inErrorState || slackChannels.length === 0}
        errored={inErrorState}
        closeOnSelect={false}
        layout="wrap"
        modal={
          // Modal comboboxes cause page layout to shift when body has padding. See KNO-7854.
          false
        }
      >
        <Combobox.Trigger aria-label={triggerLabel} />
        <Combobox.Content>
          <Combobox.Search
            label={t("slackSearchChannels")}
            className="rsk-combobox__search"
          />
          <Combobox.Options maxHeight="36">
            {slackChannels.map((channel) => (
              <Combobox.Option key={channel.id} value={channel.id}>
                <Stack align="center" gap="1">
                  <Icon
                    icon={channel.is_private ? Lock : Hash}
                    size="0"
                    aria-hidden
                  />
                  {channel.name}
                </Stack>
              </Combobox.Option>
            ))}
          </Combobox.Options>
          <Combobox.Empty />
        </Combobox.Content>
      </Combobox.Root>
      <SlackConnectionError />
      {!!connectedChannelsError && (
        <SlackErrorMessage message={connectedChannelsError} />
      )}
    </Stack>
  );
};
