import { useEffect } from "react";
import useSWR from "swr";

import { setToken } from "../lib/api";

const useSetToken = ({tenant, user, connectionsObject,}: {
  tenant: string;
  user: { id: string };
  connectionsObject: { objectId: string; collection: string };
}) => {
  const { data, error } = useSWR(
    ["/api/set_token"],
    () => setToken({ tenant, user, connectionsObject }),
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
