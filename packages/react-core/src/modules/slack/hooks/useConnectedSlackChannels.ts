import { useKnockSlackClient } from "..";
import { SlackChannelConnection } from "@knocklabs/client";
import { GenericData } from "@knocklabs/types";
import { useState } from "react";
import useSWR from "swr";

import { RecipientObject } from "../../..";
import { useKnockClient } from "../../core";
import { useTranslations } from "../../i18n";

const QUERY_KEY = "SLACK_CONNECTED_CHANNELS";

type UseConnectedSlackChannelsProps = {
  slackChannelsRecipientObject: RecipientObject;
};

type UseConnectedSlackChannelsOutput = {
  data: SlackChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: SlackChannelConnection[],
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
  updating: boolean;
};

function useConnectedSlackChannels({
  slackChannelsRecipientObject: { objectId, collection },
}: UseConnectedSlackChannelsProps): UseConnectedSlackChannelsOutput {
  const { t } = useTranslations();
  const knock = useKnockClient();
  const { connectionStatus, knockSlackChannelId } = useKnockSlackClient();

  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: connectedChannels,
    mutate,
    isValidating,
    isLoading,
  } = useSWR<SlackChannelConnection[]>(
    // Only fetch when Slack is connected
    connectionStatus === "connected"
      ? [QUERY_KEY, knockSlackChannelId, collection, objectId]
      : null,
    async () => {
      return knock.objects
        .getChannelData({
          collection,
          objectId,
          channelId: knockSlackChannelId,
        })
        .then((res) => res.data?.connections ?? [])
        .catch(() => []);
    },
    {
      onSuccess: () => {
        setError(null);
      },
    },
  );

  const updateConnectedChannels = async (
    channelsToSendToKnock: SlackChannelConnection[],
  ) => {
    setIsUpdating(true);
    try {
      await mutate(
        () =>
          knock.objects
            .setChannelData({
              objectId,
              collection,
              channelId: knockSlackChannelId,
              data: { connections: channelsToSendToKnock },
            })
            .then((res) => (res as GenericData).data?.connections ?? []),
        {
          populateCache: true,
          revalidate: false,
          optimisticData: channelsToSendToKnock,
        },
      );
    } catch (_error) {
      setError(t("slackChannelSetError") || "");
    }
    setIsUpdating(false);
  };

  return {
    data: connectedChannels ?? null,
    updateConnectedChannels,
    updating: isUpdating,
    loading: isLoading || isValidating,
    error,
  };
}

export default useConnectedSlackChannels;
