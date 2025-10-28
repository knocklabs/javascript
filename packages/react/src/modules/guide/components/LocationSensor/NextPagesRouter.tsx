import { useGuideContext } from "@knocklabs/react-core";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { checkForWindow } from "../../../core/utils";

export const LocationSensorNextPagesRouter = () => {
  const router = useRouter();
  const { client } = useGuideContext();

  useEffect(() => {
    const win = checkForWindow();
    if (!win) return;

    // Set the initial location if not yet set.
    if (!client.store.state.location) {
      client.setLocation(win.location.href);
    }

    // Remove any location chagne event listeners on the window object in case
    // they are attached.
    client.removeLocationChangeEventListeners();

    // Attach a route change event listener to the nextjs router. Note, here url
    // is the pathname and any query parameters of the new route but does not
    // include the domain or origin.
    const handleRouteChangeComplete = (url: string) => {
      client.setLocation(win.location.origin + url);
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
