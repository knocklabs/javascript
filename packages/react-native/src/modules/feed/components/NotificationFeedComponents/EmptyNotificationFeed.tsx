import { useTranslations } from "@knocklabs/react-core";
import React, { useMemo } from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

import { useTheme } from "../../../../theme/useTheme";

export interface EmptyFeedViewProps {
  styleOverride?: EmptyNotificationFeedStyle;
}

export interface EmptyNotificationFeedStyle {
  titleString?: string;
  subtitleString?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
}

const EmptyNotificationFeed: React.FC<EmptyFeedViewProps> = ({
  styleOverride = {},
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const resolvedStyle: EmptyNotificationFeedStyle = useMemo(
    () => ({
      titleStyle: styleOverride?.titleStyle ?? {
        fontSize: theme.fontSizes[2],
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.gray12,
      },
      subtitleStyle: styleOverride?.subtitleStyle ?? {
        fontSize: theme.fontSizes[2],
        color: theme.colors.gray11,
        fontWeight: theme.fontWeights.normal,
      },
      titleString: styleOverride?.titleString ?? t("emptyFeedTitle"),
      subtitleString: styleOverride?.subtitleString ?? t("emptyFeedBody"),
    }),
    [theme, styleOverride, t],
  );

  return (
    <View style={styles.container}>
      {resolvedStyle.titleString && (
        <Text style={[styles.title, resolvedStyle.titleStyle]}>
          {resolvedStyle.titleString}
        </Text>
      )}
      {resolvedStyle.subtitleString && (
        <Text style={[styles.subtitle, resolvedStyle.subtitleStyle]}>
          {resolvedStyle.subtitleString}
        </Text>
      )}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  icon: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 12,
  },
  title: {
    textAlign: "center",
    maxWidth: 170,
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    maxWidth: 170,
    marginBottom: 12,
  },
  spacer: {
    flex: 1,
  },
});

export default EmptyNotificationFeed;
