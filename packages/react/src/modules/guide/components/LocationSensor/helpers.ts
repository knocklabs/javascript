import { KnockGuideClient } from "@knocklabs/client";

import { checkForWindow } from "../../../core/utils";

export const setLocation = (client: KnockGuideClient, pathname: string) => {
  const win = checkForWindow();
  if (!win) return;
  client.setLocation(win.location.origin + pathname);
};
