import { User } from "@knocklabs/client";
import { useKnockClient } from "@knocklabs/react-core";
import { useState, useEffect } from "react";

export interface Channel {
  name: string;
  id: string;
  connected: boolean;
}

export type ContainerObject = {
  objectId: string;
  collection: string;
};

export function useSlackChannels(
  tenant: string,
  connectionsObject: ContainerObject,

  knockSlackChannelId: string,

  user: User,
  shouldRefetch: boolean,
  setHasError: (hasError: boolean) => void,
  hasError: boolean,
): {
  data: { channels: Channel[] };
  isLoading: boolean;
  error: boolean;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ channels: Channel[] }>({
    channels: [],
  });

  const knockClient = useKnockClient()

  useEffect(() => {
    if (!hasError) {
      const fetchChannels = async () => {
        try {
          await knockClient.slack
            .getChannels({
              tenant,
              connectionsObject,
              knockChannelId: knockSlackChannelId,
            })
            .then((res) => {
              const { channels } = res;
              setData({ channels });
              setIsLoading(false);
            });
        } catch (error) {
          console.error(error);
          setHasError(true);
        }
      };

      setIsLoading(true);
      fetchChannels();
    }
  }, [
    tenant,
    connectionsObject,
    hasError,
    knockClient.slack,
    knockSlackChannelId,
    setHasError,
    shouldRefetch,
  ]);

  return { data, isLoading, error: false };
}
