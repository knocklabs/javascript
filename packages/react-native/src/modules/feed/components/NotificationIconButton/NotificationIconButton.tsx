import { type BadgeCountType } from "@knocklabs/react-core";
import React from "react";
import {
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { BellIcon } from "../../../../assets/BellIcon";

import { UnseenBadge } from "./UnseenBadge";

export interface NotificationIconButtonProps {
  onClick: () => void;
  badgeCountType?: BadgeCountType;
  styleOverride?: NotificationIconButtonStyle;
}

export interface NotificationIconButtonStyle {
  textStyle?: TextStyle;
  bellIconStyle?: ViewStyle;
  bellIconColor?: string;
  bellIconStrokeWidth?: number;
  badgeStyle?: ViewStyle;
}

export const NotificationIconButton: React.FC<NotificationIconButtonProps> = ({
  onClick,
  badgeCountType = "unread",
  styleOverride = {},
}) => {
  return (
    <TouchableOpacity
      style={styles.notificationIconButton}
      accessibilityRole="button"
      accessibilityLabel="Open notification feed"
      onPress={onClick}
    >
      <View style={styles.iconContainer}>
        <BellIcon
          style={styleOverride.bellIconStyle}
          strokeColor={styleOverride.bellIconColor}
          strokeWidth={styleOverride.bellIconStrokeWidth}
        />
        <View style={styles.badgeContainer}>
          <UnseenBadge
            badgeCountType={badgeCountType}
            textStyle={styleOverride.textStyle}
            containerStyle={styleOverride.badgeStyle}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationIconButton: {
    padding: 10,
  },
  iconContainer: {
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -5,
    left: 10,
  },
});
