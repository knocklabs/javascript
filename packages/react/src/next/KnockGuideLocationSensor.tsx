"use client";

import { useGuideContext } from "@knocklabs/react-core";
// Note the .js suffix for Next 15 ESM friendliness:
import { usePathname, useSearchParams } from "next/navigation.js";
import { useRouter } from "next/router.js";
import React from "react";

import { checkForWindow } from "../modules/core/utils";

const PagesRouter: React.FC = () => {
  const router = useRouter();
  const { client } = useGuideContext();

  React.useEffect(() => {
    const win = checkForWindow();
    if (!win) return;

    // Set the initial location if not yet set.
    if (!client.store.state.location) {
      client.setLocation(win.location.href);
    }

    // Remove any location change event listeners on the window object in case
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

const AppRouter: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryStr = searchParams.toString();

  const { client } = useGuideContext();

  React.useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  React.useEffect(() => {
    const win = checkForWindow();
    if (!win) return;

    client.setLocation(win.location.href);
  }, [client, pathname, queryStr]);

  return null;
};

export const KnockGuideLocationSensor = {
  PagesRouter,
  AppRouter,
};
