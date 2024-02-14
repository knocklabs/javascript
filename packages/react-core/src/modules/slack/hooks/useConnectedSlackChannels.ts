import { ContainerObject, useKnockSlackClient } from "..";
import { SlackChannelConnection } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { useKnockClient } from "../../core";

type UseSlackChannelsProps = {
  connectionsObject: ContainerObject;
};

type UseSlackChannelOutput = {
  data: SlackChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: SlackChannelConnection[],
  ) => void;
  loading: boolean;
  error: string | null;
};

function useConnectedSlackChannels({
  connectionsObject: { objectId, collection },
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knock = useKnockClient();
  const { connectionStatus, knockSlackChannelId } = useKnockSlackClient();
  const [connectedChannels, setConnectedChannels] = useState<
    null | SlackChannelConnection[]
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setConnectedChannels([])
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
    try {
      await knock.objects.setChannelData({
        objectId,
        collection,
        channelId: knockSlackChannelId,
        data: { connections: channelsToSendToKnock },
      });
      fetchAndSetConnectedChannels();
    } catch (error) {
      setError("Error setting channels.");
    }
  };

  return {
    data: connectedChannels,
    updateConnectedChannels,
    loading: isLoading,
    error,
  };
}

export default useConnectedSlackChannels;
