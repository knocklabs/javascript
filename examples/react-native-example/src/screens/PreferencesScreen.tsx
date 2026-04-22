import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import type { ScreenProps } from "../navigation";
import { colors, radius, spacing } from "../theme";

const channels = [
  { id: "email", label: "Email", description: "Transactional and marketing" },
  { id: "push", label: "Push", description: "Mobile push notifications" },
  {
    id: "in_app_feed",
    label: "In-app feed",
    description: "Notifications inside the app",
  },
  { id: "sms", label: "SMS", description: "Text messages" },
] as const;

type ChannelId = (typeof channels)[number]["id"];

export default function PreferencesScreen(_: ScreenProps<"Preferences">) {
  const [enabled, setEnabled] = useState<Record<ChannelId, boolean>>({
    email: true,
    push: true,
    in_app_feed: true,
    sms: false,
  });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {channels.map(({ id, label, description }) => (
        <View key={id} style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowDescription}>{description}</Text>
          </View>
          <Switch
            value={enabled[id]}
            onValueChange={(v) => setEnabled((prev) => ({ ...prev, [id]: v }))}
            trackColor={{ true: colors.accent, false: colors.border }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
    gap: spacing.xs,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  rowDescription: {
    color: colors.mutedText,
    fontSize: 13,
  },
});
