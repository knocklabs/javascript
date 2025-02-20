import { KnockGuide, KnockGuideStep } from "@knocklabs/client";

export type ButtonContent = {
  text: string;
  action: string;
};

export type TargetButton = ButtonContent & {
  name: string;
};

export type TargetButtonWithGuideContext = {
  button: TargetButton;
  step: KnockGuideStep;
  guide: KnockGuide;
};
