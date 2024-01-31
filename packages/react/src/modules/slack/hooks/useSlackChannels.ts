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
  shouldRefetch: boolean,
  setErrorMessage: (errorMessage: string | null) => void,
  errorMessage: string | null,
): {
  data: { channels: Channel[] };
  isLoading: boolean;
  error: boolean;
} {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ channels: Channel[] }>({
    channels: [],
  });

  const knockClient = useKnockClient();

  useEffect(() => {
    if (!errorMessage) {
      const fetchChannels = async () => {
        try {
          await knockClient.slack
            .getChannels({
              tenant,
              connectionsObject,
              knockChannelId: knockSlackChannelId,
            })
            .then((res) => {
              if (res.code === "ERR_BAD_REQUEST") {
                const message = res.response?.data?.message
                setData({ channels: [] });
                setErrorMessage(message);
                setIsLoading(false);
                return;
              }

              setData({ channels: res.channels });
              setErrorMessage(null);
              setIsLoading(false);
              return;
            });
        } catch (error) {
          console.error(error);
          setErrorMessage("Something went wrong.");
        }
      };

      setIsLoading(true);
      fetchChannels();
    }
  }, [
    tenant,
    connectionsObject,
    errorMessage,
    knockClient.slack,
    knockSlackChannelId,
    setErrorMessage,
    shouldRefetch,
  ]);

  return { data, isLoading, error: false };
}
