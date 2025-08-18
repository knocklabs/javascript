import { KnockGuideContentTypesMapping } from "@knocklabs/client";

import { UseGuideWithContentTypes, useGuide } from "./useGuide";
import { UseGuidesWithContentTypes, useGuides } from "./useGuides";

export const useGuideContentTypes = <
  M extends KnockGuideContentTypesMapping,
>() => {
  return {
    useGuide: useGuide as UseGuideWithContentTypes<M>,
    useGuides: useGuides as UseGuidesWithContentTypes<M>,
  };
};
