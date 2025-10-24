"use client";

import { useGuideContext } from "@knocklabs/react-core";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { setLocation } from "./helpers";

export const NextAppRouter = () => {
  const pathname = usePathname();
  const { client } = useGuideContext();

  useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  useEffect(() => {
    setLocation(client, pathname);
  }, [client, pathname]);

  return null;
};
