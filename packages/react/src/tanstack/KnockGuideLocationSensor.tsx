import { useGuideContext } from "@knocklabs/react-core";
import { useLocation } from "@tanstack/react-router";
import React from "react";

import { checkForWindow } from "../modules/core/utils";

export const KnockGuideLocationSensor: React.FC = () => {
  const { href } = useLocation();
  const { client } = useGuideContext();

  React.useEffect(() => {
    client.removeLocationChangeEventListeners();
  }, [client]);

  React.useEffect(() => {
    const win = checkForWindow();
    if (!win) return;

    // href here is the full path of the location, including pathname, search,
    // and hash but does not include the origin.
    client.setLocation(win.location.origin + href);
  }, [client, href]);

  return null;
};
