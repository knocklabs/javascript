'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGuideContext } from "@knocklabs/react-core";

import { setLocation } from "./helpers";

export const NextAppRouter = () => {
  const pathname = usePathname();
  const { client } = useGuideContext();

  useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  useEffect(() => {
    setLocation(client, pathname)
  }, [client, pathname]);

  return null;
}
