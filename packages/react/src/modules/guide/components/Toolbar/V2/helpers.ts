import { KnockGuide } from "@knocklabs/client";

import { checkForWindow } from "../../../../../modules/core";

// Use this param to start Toolbar and enter into a debugging session when
// it is present and set to true.
const TOOLBAR_QUERY_PARAM = "knock_guide_toolbar";

// Optional, when present pin/focus on this guide.
const GUIDE_KEY_PARAM = "focused_guide_key";

// Use this key to read and write the run config data.
const LOCAL_STORAGE_KEY = "knock_guide_debug";

export type ToolbarV2RunConfig = {
  isVisible: boolean;
  focusedGuideKeys?: Record<KnockGuide["key"], true>;
};

export const getRunConfig = (): ToolbarV2RunConfig => {
  const fallback = { isVisible: false };

  const win = checkForWindow();
  if (!win || !win.location) {
    return fallback;
  }

  const urlSearchParams = new URLSearchParams(win.location.search);
  const toolbarParamValue = urlSearchParams.get(TOOLBAR_QUERY_PARAM);
  const guideKeyParamValue = urlSearchParams.get(GUIDE_KEY_PARAM);

  // If toolbar param detected in the URL, write to local storage before
  // returning.
  if (toolbarParamValue !== null) {
    const config: ToolbarV2RunConfig = {
      isVisible: toolbarParamValue === "true",
    };
    if (guideKeyParamValue) {
      config.focusedGuideKeys = { [guideKeyParamValue]: true };
    }

    writeRunConfigLS(config);
    return config;
  }

  // If not detected, check local storage for a persisted run config. If not
  // present then fall back to a default config.
  return readRunConfigLS() || fallback;
};

const writeRunConfigLS = (config: ToolbarV2RunConfig) => {
  const win = checkForWindow();
  if (!win || !win.localStorage) return;

  try {
    win.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
};

const readRunConfigLS = (): ToolbarV2RunConfig | undefined => {
  const win = checkForWindow();
  if (!win || !win.localStorage) return undefined;

  try {
    const stored = win.localStorage.getItem(LOCAL_STORAGE_KEY);
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
  if (!win || !win.localStorage) return;

  try {
    win.localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // localStorage may be unavailable (e.g. private browsing)
  }
};
