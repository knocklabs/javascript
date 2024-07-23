// ActionButton.tsx
import React from "react";
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

  const defaultStyles: {
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
        fontFamily: theme.fontFamily.sanserif,
        fontSize: theme.fontSizes.knock2,
        fontWeight: theme.fontWeights.medium,
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
        fontSize: theme.fontSizes.knock2,
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
        flex: 1,
      },
      text: {
        fontSize: theme.fontSizes.knock2,
        fontWeight: "500",
        color: theme.colors.gray12,
      },
      fillAvailableSpace: true,
    },
  };
  const buttonTypeStyle = defaultStyles[type];

  return (
    <TouchableOpacity
      onPress={action}
      style={[
        layoutStyles.button,
        buttonTypeStyle.button,
        styleOverride.button,
      ]}
    >
      <Text
        style={[layoutStyles.text, buttonTypeStyle.text, styleOverride.text]}
      >
        {title}
      </Text>
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
