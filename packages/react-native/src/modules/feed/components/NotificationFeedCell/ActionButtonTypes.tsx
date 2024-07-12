// ActionButtonStyles.ts
import theme from "../../../../helpers/theme";

import { ActionButtonStyle } from "./ActionButton";

export enum ActionButtonType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERTIARY = "tertiary",
}

export const defaultStyles: {
  [key in ActionButtonType]: ActionButtonStyle;
} = {
  [ActionButtonType.PRIMARY]: {
    button: {
      backgroundColor: theme.colors.accent9,
      borderWidth: 0,
      borderColor: "transparent",
      borderRadius: 4,
    },
    text: {
      fontSize: theme.fontSizes.knock3,
      fontWeight: "500",
      color: theme.colors.white,
    },
    fillAvailableSpace: false,
  },
  [ActionButtonType.SECONDARY]: {
    button: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.gray6,
      borderRadius: 4,
    },
    text: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.gray12,
    },
    fillAvailableSpace: false,
  },
  [ActionButtonType.TERTIARY]: {
    button: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.colors.gray6,
      borderRadius: 4,
    },
    text: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.gray12,
    },
    fillAvailableSpace: true,
  },
};
