import { useKnockSlackClient } from "..";
import { SlackChannelConnection } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { RecipientObject } from "../../..";
import { useKnockClient } from "../../core";
import { useTranslations } from "../../i18n";

type UseConnectedSlackChannelsProps = {
  slackChannelsRecipientObject: RecipientObject;
};

type UseConnectedSlackChannelOutput = {
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
}: UseConnectedSlackChannelsProps): UseConnectedSlackChannelOutput {
  const { t } = useTranslations();
  const knock = useKnockClient();
  const { connectionStatus, knockSlackChannelId } = useKnockSlackClient();
  const [connectedChannels, setConnectedChannels] = useState<
    null | SlackChannelConnection[]
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAndSetConnectedChannels = useCallback(() => {
    setIsLoading(true);
    const getConnectedChannels = async () =>
      await knock.objects.getChannelData({
        collection,
        objectId,
        channelId: knockSlackChannelId,
      });

    getConnectedChannels()
      .then((res) => {
        if (res?.data?.connections) {
          setConnectedChannels(res?.data?.connections);
        } else {
          setConnectedChannels([]);
        }
        setError(null);
        setIsLoading(false);
      })
      .catch(() => {
        setConnectedChannels([]);
        setError(null);
        setIsLoading(false);
      });
  }, [collection, knock.objects, knockSlackChannelId, objectId]);

  useEffect(() => {
    if (
      connectionStatus === "connected" &&
      !connectedChannels &&
      !error &&
      !isLoading
    ) {
      fetchAndSetConnectedChannels();
    }
  }, [
    connectedChannels,
    fetchAndSetConnectedChannels,
    isLoading,
    error,
    connectionStatus,
  ]);

  const updateConnectedChannels = async (
    channelsToSendToKnock: SlackChannelConnection[],
  ) => {
    setIsUpdating(true);
    try {
      await knock.objects.setChannelData({
        objectId,
        collection,
        channelId: knockSlackChannelId,
        data: { connections: channelsToSendToKnock },
      });
      fetchAndSetConnectedChannels();
    } catch (_error) {
      setError(t("slackChannelSetError") || "");
    }
    setIsUpdating(false);
  };

  return {
    data: connectedChannels,
    updateConnectedChannels,
    updating: isUpdating,
    loading: isLoading,
    error,
  };
}

export default useConnectedSlackChannels;
