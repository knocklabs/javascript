import { RecipientObject } from "@knocklabs/react";
import { useEffect } from "react";
import useSWR from "swr";

import { setToken } from "../lib/api";

const useSetToken = ({
  tenant,
  user,
  msTeamsChannelsRecipientObject,
}: {
  tenant: string;
  user: { id: string };
  msTeamsChannelsRecipientObject: RecipientObject;
}) => {
  const { data, error } = useSWR(
    ["/api/set_token"],
    () => setToken({ tenant, user, msTeamsChannelsRecipientObject }),
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
