// ActionButton.tsx
import React from "react";
import { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

import { useTheme } from "../../../theme/useTheme";

export enum ActionButtonType {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  TERTIARY = "tertiary",
}

export interface ActionButtonProps {
  title: string;
  type?: ActionButtonType;
  styleOverride?: ActionButtonStyle;
  action: () => void;
}

export interface ActionButtonStyle {
  button?: ViewStyle;
  text?: TextStyle;
  fillAvailableSpace?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  type = ActionButtonType.PRIMARY,
  styleOverride = {},
  action,
}) => {
  const theme = useTheme();

  const defaultStyles = useMemo(
    () => ({
      baseButton: {
        borderRadius: 4,
        borderWidth: 1,
        borderColor: theme.colors.gray6,
        backgroundColor: "transparent",
      },
      baseText: {
        fontFamily: theme.fontFamily.sanserif,
        fontSize: theme.fontSizes.knock2,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.gray12,
      },
      [ActionButtonType.PRIMARY]: {
        button: {
          backgroundColor: theme.colors.accent9,
          borderWidth: 0,
        },
        text: {
          color: theme.colors.white,
        },
        fillAvailableSpace: false,
      },
      [ActionButtonType.SECONDARY]: {
        button: {},
        text: {},
        fillAvailableSpace: false,
      },
      [ActionButtonType.TERTIARY]: {
        button: {
          flex: 1,
        },
        text: {},
        fillAvailableSpace: true,
      },
    }),
    [theme],
  );

  const buttonTypeStyle = defaultStyles[type];

  const resolvedStyle = useMemo(
    () => ({
      button: {
        ...defaultStyles.baseButton,
        ...buttonTypeStyle.button,
        ...styleOverride.button,
      },
      text: {
        ...defaultStyles.baseText,
        ...buttonTypeStyle.text,
        ...styleOverride.text,
      },
      fillAvailableSpace:
        styleOverride.fillAvailableSpace ?? buttonTypeStyle.fillAvailableSpace,
    }),
    [buttonTypeStyle, styleOverride, defaultStyles],
  );

  return (
    <TouchableOpacity
      onPress={action}
      style={[
        layoutStyles.button,
        resolvedStyle.button,
        resolvedStyle.fillAvailableSpace ? { flex: 1 } : {},
      ]}
    >
      <Text style={[layoutStyles.text, resolvedStyle.text]}>{title}</Text>
    </TouchableOpacity>
  );
};

const layoutStyles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    textAlign: "center",
  },
});
