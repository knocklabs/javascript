import { SlackChannel } from "@knocklabs/client";

export const sortSlackChannelsAlphabetically = (
  channels: readonly SlackChannel[],
) =>
  [...channels].sort((channel1, channel2) =>
    channel1.name.toLowerCase().localeCompare(channel2.name.toLowerCase()),
  );
