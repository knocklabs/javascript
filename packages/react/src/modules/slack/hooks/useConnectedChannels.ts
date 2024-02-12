import { SlackChannelConnection } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import { useCallback, useEffect, useState } from "react";

import { ContainerObject } from "./useSlackChannels";

type UseSlackChannelsProps = {
  connectionsObject: ContainerObject;
  knockSlackChannelId: string;
};

type UseSlackChannelOutput = {
  data: SlackChannelConnection[] | null;
  updateConnectedChannels: (
    connectedChannels: SlackChannelConnection[],
  ) => void;
};

export function useConnectedChannels({
  connectionsObject: { objectId, collection },
  knockSlackChannelId,
}: UseSlackChannelsProps): UseSlackChannelOutput {
  const [connectedChannels, setConnectedChannels] = useState<
    null | SlackChannelConnection[]
  >(null);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const knockClient = useKnockClient();

  const fetchAndSetConnectedChannels = useCallback(() => {
    try {
      const getConnectedChannelIds = async () =>
        await knockClient.objects.getChannelData({
          collection,
          objectId,
          channelId: knockSlackChannelId,
        });
      getConnectedChannelIds().then((res) => {
        setConnectedChannels(res?.data?.connections);
      });
    } catch (error) {
      console.log(error);
    }
  }, [collection, knockClient.objects, knockSlackChannelId, objectId]);

  useEffect(() => {
    if (!connectedChannels || shouldRefetch) {
      fetchAndSetConnectedChannels();
      setShouldRefetch(false);
    }
  }, [connectedChannels, fetchAndSetConnectedChannels, shouldRefetch]);

  const updateConnectedChannels = async (
    channelsToSendToKnock: SlackChannelConnection[],
  ) => {
    try {
      await knockClient.objects.setChannelData({
        objectId,
        collection,
        channelId: knockSlackChannelId,
        data: { connections: channelsToSendToKnock },
        userId: knockClient.userId!,
      });
      setShouldRefetch(true);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    data: connectedChannels,
    updateConnectedChannels,
  };
}
