"use client";

import { useGuideContext } from "@knocklabs/react-core";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { checkForWindow } from "../../../core/utils";

export const LocationSensorNextAppRouter = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryStr = searchParams.toString();

  const { client } = useGuideContext();

  useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  useEffect(() => {
    const win = checkForWindow();
    if (!win) return;

    client.setLocation(win.location.href);
  }, [client, pathname, queryStr]);

  return null;
};
