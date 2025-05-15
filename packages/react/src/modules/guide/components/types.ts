import { KnockGuide, KnockGuideStep } from "@knocklabs/client";

export type ImageContent = {
  url: string;
  alt: string;
  action: string;
};

export type TargetImage = ImageContent;

export type TargetImageWithGuide = {
  image: ImageContent;
  step: KnockGuideStep;
  guide: KnockGuide;
};

export type ButtonContent = {
  text: string;
  action: string;
};

export type TargetButton = ButtonContent & {
  name: string;
};

export type TargetButtonWithGuide = {
  button: TargetButton;
  step: KnockGuideStep;
  guide: KnockGuide;
};
