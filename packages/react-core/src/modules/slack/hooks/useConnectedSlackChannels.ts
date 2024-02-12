import { ContainerObject, useKnockSlackClient } from "..";
import { SlackChannelConnection } from "@knocklabs/client";
import { useCallback, useEffect, useState } from "react";

import { useKnockClient } from "../../core";

type UseSlackChannelsProps = {
  connectionsObject: ContainerObject;
  knockSlackChannelId: string;
};

type UseSlackChannelOutput = {
  data: SlackChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: SlackChannelConnection[],
  ) => void;
  loading: boolean;
};

function useConnectedSlackChannels({
  connectionsObject: { objectId, collection },
  knockSlackChannelId,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const knock = useKnockClient();
  const { setErrorLabel } = useKnockSlackClient();
  const [connectedChannels, setConnectedChannels] = useState<
    null | SlackChannelConnection[]
  >(null);

  const [isLoading, setIsLoading] = useState(false);

  const fetchAndSetConnectedChannels = useCallback(() => {
    setIsLoading(true);
    try {
      const getConnectedChannelIds = async () =>
        await knock.objects.getChannelData({
          collection,
          objectId,
          channelId: knockSlackChannelId,
        });
      getConnectedChannelIds().then((res) => {
        setIsLoading(false);
        setConnectedChannels(res?.data?.connections);
      });
    } catch (error) {
      setIsLoading(false);
      setErrorLabel("Error fetching channels.");
    }
  }, [collection, knock.objects, knockSlackChannelId, objectId, setErrorLabel]);

  useEffect(() => {
    if (!connectedChannels && !isLoading) {
      fetchAndSetConnectedChannels();
    }
  }, [connectedChannels, fetchAndSetConnectedChannels, isLoading]);

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
      setErrorLabel("Error setting channels.");
    }
  };

  return {
    data: connectedChannels,
    updateConnectedChannels,
    loading: isLoading,
  };
}

export default useConnectedSlackChannels;
