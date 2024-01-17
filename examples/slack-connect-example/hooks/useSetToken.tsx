import { useEffect } from "react";
import useSWR from "swr";

import { setToken } from "../lib/api";

const useSetToken = ({
  tenant,
  user,
  slackChannelsRecipientObject,
}: {
  tenant: string;
  user: { id: string };
  slackChannelsRecipientObject: { objectId: string; collection: string };
}) => {
  const { data, error } = useSWR(
    ["/api/set_token"],
    () => setToken({ tenant, user, slackChannelsRecipientObject }),
    {},
  );

  useEffect(() => {
    if (data?.token) {
      localStorage.setItem("knock-user-token", data?.token);
    }
  }, [data]);

  return {
    isLoading: !error && !data,
    isError: error,
  };
};

export default useSetToken;
