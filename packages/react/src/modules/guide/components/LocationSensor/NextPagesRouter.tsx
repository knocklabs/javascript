import { useGuideContext } from "@knocklabs/react-core";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { setLocation } from "./helpers";

export const LocationSensorNextPagesRouter = () => {
  const router = useRouter();
  const { client } = useGuideContext();

  useEffect(() => {
    // Set the initial location if not yet set.
    if (!client.store.state.location) {
      setLocation(client, router.pathname);
    }

    // Remove any location chagne event listeners on the window object in case
    // they are attached.
    client.removeLocationChangeEventListeners();

    // Attach a location change event listener from nextjs router.
    const handleRouteChangeComplete = (pathname: string) => {
      setLocation(client, pathname);
    };
    router.events.on("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
    };
    // We want to run this effect once per client instance and `router` is not
    // guaranteed to be referentially stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  return null;
};
