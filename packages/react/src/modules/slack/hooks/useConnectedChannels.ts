import { SlackChannelConnection } from "@knocklabs/client";
import { useKnockSlackClient } from "@knocklabs/react-core";
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
  const { knock, setErrorLabel } = useKnockSlackClient();
  const [connectedChannels, setConnectedChannels] = useState<
    null | SlackChannelConnection[]
  >(null);
  const [shouldRefetch, setShouldRefetch] = useState(false);

  const fetchAndSetConnectedChannels = useCallback(() => {
    try {
      const getConnectedChannelIds = async () =>
        await knock.objects.getChannelData({
          collection,
          objectId,
          channelId: knockSlackChannelId,
        });
      getConnectedChannelIds().then((res) => {
        setConnectedChannels(res?.data?.connections);
      });
    } catch (error) {
      setErrorLabel("Error fetching channels.")
    }
  }, [collection, knock.objects, knockSlackChannelId, objectId, setErrorLabel]);

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
      await knock.objects.setChannelData({
        objectId,
        collection,
        channelId: knockSlackChannelId,
        data: { connections: channelsToSendToKnock },
        userId: knock.userId!,
      });
      setShouldRefetch(true);
    } catch (error) {
      setErrorLabel("Error setting channels.")
    }
  };

  return {
    data: connectedChannels,
    updateConnectedChannels,
  };
}
