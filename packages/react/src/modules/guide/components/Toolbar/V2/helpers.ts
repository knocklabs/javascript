import { KnockGuide } from "@knocklabs/client";

import { checkForWindow } from "../../../../../modules/core";

export const sharedTooltipProps = {
  delayDuration: 1000,
};

export type DisplayOption = "all-guides" | "only-active" | "only-eligible";

// Use this param to start Toolbar and enter into a debugging session when
// it is present and set to true.
const TOOLBAR_QUERY_PARAM = "knock_guide_toolbar";

// Optional, when present pin/focus on this guide.
const GUIDE_KEY_PARAM = "focused_guide_key";

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

  if (toolbarParamValue === null) {
    return fallback;
  }

  const config: ToolbarV2RunConfig = {
    isVisible: toolbarParamValue === "true",
  };
  if (guideKeyParamValue) {
    config.focusedGuideKeys = { [guideKeyParamValue]: true };
  }

  return config;
};

export const FOCUS_ERRORS = {
  focusUnknownGuide: "No such guide exists",
  focusUncommittedGuide: "This guide has not been committed",
  focusUnselectableGuide: "No component that can display this guide is present",
};
