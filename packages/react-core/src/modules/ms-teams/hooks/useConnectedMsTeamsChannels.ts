import { useKnockMsTeamsClient } from "..";
import { MsTeamsChannelConnection } from "@knocklabs/client";
import { useState } from "react";
import useSWR from "swr";

import { RecipientObject } from "../../..";
import { useKnockClient } from "../../core";
import { useTranslations } from "../../i18n";

const QUERY_KEY = "MS_TEAMS_CONNECTED_CHANNELS";

type UseConnectedMsTeamsChannelsProps = {
  msTeamsChannelsRecipientObject: RecipientObject;
};

type UseConnectedMsTeamsChannelsOutput = {
  data: MsTeamsChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: MsTeamsChannelConnection[],
  ) => Promise<void>;
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

  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    data: connectedChannels,
    mutate,
    isValidating,
    isLoading,
  } = useSWR<MsTeamsChannelConnection[]>(
    // Only fetch when Microsoft Teams is connected
    connectionStatus === "connected"
      ? [QUERY_KEY, knockMsTeamsChannelId, collection, objectId]
      : null,
    async () => {
      return knock.objects
        .getChannelData({
          collection,
          objectId,
          channelId: knockMsTeamsChannelId,
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
      mutate();
    } catch (_error) {
      setError(t("msTeamsChannelSetError") || "");
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

export default useConnectedMsTeamsChannels;
