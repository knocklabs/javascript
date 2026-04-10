export const sharedTooltipProps = {
  delayDuration: 1000,
};

export type DisplayOption = "all-guides" | "only-active" | "only-eligible";

export const FOCUS_ERRORS = {
  focusUnknownGuide: "No such guide exists",
  focusUncommittedGuide: "This guide has not been committed",
  focusUnselectableGuide: "No component that can display this guide is present",
};
