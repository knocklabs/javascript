import { checkForWindow } from "../../../../../modules/core";

// Use this param to start Toolbar and enter into a debugging session when
// it is present and set to true.
const TOOLBAR_QUERY_PARAM = "knock_guide_toolbar";

export const getRunConfig = () => {
  const win = checkForWindow();
  if (!win || !win.location) {
    return undefined;
  }

  const urlSearchParams = new URLSearchParams(win.location.search);

  return {
    isVisible: urlSearchParams.get(TOOLBAR_QUERY_PARAM) === "true",
  };
};
