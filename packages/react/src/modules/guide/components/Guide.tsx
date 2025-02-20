import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { UseGuideReturn, useGuide } from "@knocklabs/react-core";
import React, { useEffect } from "react";

interface RenderProps extends UseGuideReturn {
  guide: KnockGuide;
  step: KnockGuideStep;
}

type Props = {
  filters: KnockGuideFilterParams;
  children: (renderProps: RenderProps) => React.ReactElement;
};

export const Guide: React.FC<Props> = ({ filters, children }) => {
  const {
    client,
    colorMode,
    guide,
    step,
    markAsSeen,
    markAsInteracted,
    markAsArchived,
  } = useGuide(filters);

  // Automatically mark the guide as seen upon the first render.
  useEffect(() => markAsSeen(), [markAsSeen]);

  if (!guide || !step) return null;

  return children({
    client,
    colorMode,
    guide,
    step,
    markAsSeen,
    markAsInteracted,
    markAsArchived,
  });
};
