import { useEffect } from "react";
import useSWR from "swr";

import useLocalStorage from "./useLocalStorage";
import { identify } from "../lib/api";

const useIdentify = () => {
  console.log("Use identify");
  const [userId, setUserId] = useLocalStorage("demo-user-id", undefined);
  const { data, error } = useSWR(
    ["/api/identify", userId],
    () => identify({ id: userId }),
    { revalidateOnFocus: false, revalidateOnMount: false },
  );

  useEffect(() => {
    if (!userId && data?.user && userId != data?.user.id) {
      setUserId!(data?.user?.id);
    }
  }, [userId, data, setUserId]);

  return {
    userId: userId,
    isLoading: !error && !data,
    isError: error,
  };
};

export default useIdentify;
