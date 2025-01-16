import { useKnockMsTeamsClient } from "..";
import { MsTeamsChannelConnection } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { RecipientObject } from "../../..";
import { useKnockClient } from "../../core";
import { useTranslations } from "../../i18n";

type UseConnectedMsTeamsChannelsProps = {
  msTeamsChannelsRecipientObject: RecipientObject;
};

type UseConnectedMsTeamsChannelsOutput = {
  data: MsTeamsChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: MsTeamsChannelConnection[],
  ) => void;
  loading: boolean;
  error: string | null;
  updating: boolean;
};

function useConnectedMsTeamsChannels({
  msTeamsChannelsRecipientObject: { objectId, collection },
}: UseConnectedMsTeamsChannelsProps): UseConnectedMsTeamsChannelsOutput {
  const { t } = useTranslations();
  const knock = useKnockClient();
  const { connectionStatus, knockMsTeamsChannelId } = useKnockMsTeamsClient();
  const [connectedChannels, setConnectedChannels] = useState<
    null | MsTeamsChannelConnection[]
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
        channelId: knockMsTeamsChannelId,
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
  }, [collection, knock.objects, knockMsTeamsChannelId, objectId]);

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
    channelsToSendToKnock: MsTeamsChannelConnection[],
  ) => {
    setIsUpdating(true);
    try {
      await knock.objects.setChannelData({
        objectId,
        collection,
        channelId: knockMsTeamsChannelId,
        data: { connections: channelsToSendToKnock },
      });
      fetchAndSetConnectedChannels();
    } catch (_error) {
      setError(t("msTeamsChannelSetError") || "");
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

export default useConnectedMsTeamsChannels;
