import { useGuideContext } from "@knocklabs/react-core";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { setLocation } from "./helpers";

export const NextPagesRouter = () => {
  const router = useRouter();
  const { client } = useGuideContext();

  useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  useEffect(() => {
    const handleRouteChangeComplete = (pathname: string) => {
      setLocation(client, pathname);
    };

    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
  }, [client, router.events]);

  return null;
};
