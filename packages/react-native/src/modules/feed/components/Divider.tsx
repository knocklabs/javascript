import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

import { useTheme } from "../../../theme/useTheme";

export interface DividerViewProps {
  styleOverride?: ViewStyle;
}

const DividerView: React.FC<DividerViewProps> = ({ styleOverride }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.gray6,
    },
  });

  return <View style={[styles.divider, styleOverride]} />;
};

export default DividerView;
