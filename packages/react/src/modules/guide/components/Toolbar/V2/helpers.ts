import { checkForWindow } from "../../../../../modules/core";

// Use this param to start Toolbar and enter into a debugging session when
// it is present and set to true.
const TOOLBAR_QUERY_PARAM = "knock_guide_toolbar";

// Use this key to read and write the run config data.
const LOCAL_STORAGE_KEY = "knock_guide_debug";

type ToolbarV2RunConfig = {
  isVisible: boolean;
};

export const getRunConfig = (): ToolbarV2RunConfig | undefined => {
  const win = checkForWindow();
  if (!win || !win.location) {
    return undefined;
  }

  const urlSearchParams = new URLSearchParams(win.location.search);
  const toolbarParamValue = urlSearchParams.get(TOOLBAR_QUERY_PARAM);

  // If toolbar param detected in the URL, write to local storage before
  // returning.
  if (toolbarParamValue !== null) {
    const config = {
      isVisible: toolbarParamValue === "true",
    };
    writeRunConfigLS(config);
    return config;
  }

  // If not detected, check local storage for a persisted run config. If not
  // present then fall back to a default config.
  return (
    readRunConfigLS() || {
      isVisible: false,
    }
  );
};

const writeRunConfigLS = (config: ToolbarV2RunConfig) => {
  const win = checkForWindow();
  try {
    win?.localStorage?.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
};

const readRunConfigLS = (): ToolbarV2RunConfig | undefined => {
  const win = checkForWindow();
  try {
    const stored = win?.localStorage?.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
  return undefined;
};

export const clearRunConfigLS = () => {
  const win = checkForWindow();
  try {
    win?.localStorage?.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
};
