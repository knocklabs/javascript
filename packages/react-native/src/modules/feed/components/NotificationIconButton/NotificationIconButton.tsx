import React from "react";
import { StyleSheet, TextStyle, TouchableOpacity, View } from "react-native";

import { BellIcon } from "../../../../assets/BellIcon";

import { BadgeCountType, UnseenBadge } from "./UnseenBadge";

export interface NotificationIconButtonProps {
  onClick: () => void;
  badgeCountType?: BadgeCountType;
  styleOverride?: NotificationIconButtonStyle;
}

export interface NotificationIconButtonStyle {
  textStyle?: TextStyle;
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
        <BellIcon />
        <View style={styles.badgeContainer}>
          <UnseenBadge
            badgeCountType={badgeCountType}
            textStyle={styleOverride.textStyle}
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
