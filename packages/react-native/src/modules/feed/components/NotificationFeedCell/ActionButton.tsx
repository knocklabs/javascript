// ActionButton.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { ActionButtonType, defaultStyles } from "./ActionButtonTypes";

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

const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  type = ActionButtonType.PRIMARY,
  styleOverride = {},
  action,
}) => {
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

export default ActionButton;
