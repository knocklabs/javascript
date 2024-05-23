import { useEffect, useState } from "react";
import useSWR from "swr";

import { identify } from "../lib/api";

import useLocalStorage from "./useLocalStorage";

const useIdentify = () => {
  const [userId, setUserId] = useLocalStorage("demo-user-id", undefined);
  const [userToken, setUserToken] = useState();
  const { data, error } = useSWR(
    ["/api/identify", userId],
    () => identify({ id: userId }),
    { revalidateOnFocus: false, revalidateOnMount: false },
  );

  useEffect(() => {
    if (!userId && data?.user && userId != data?.user.id) {
      setUserId!(data?.user?.id);
    }
    if (!userToken && data?.userToken && userToken != data?.userToken) {
      setUserToken!(data?.userToken);
    }
  }, [userId, data, setUserId]);

  return {
    userId: userId,
    userToken,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIdentify;
