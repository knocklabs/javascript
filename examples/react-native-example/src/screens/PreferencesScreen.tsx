import { usePreferences } from "@knocklabs/react-native";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useAuth } from "../auth";
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

export default function PreferencesScreen() {
  const { signOut } = useAuth();
  const { preferences, setPreferences, isLoading } = usePreferences();

  const channelTypes = preferences?.channel_types ?? {};

  const onToggle = (id: ChannelId, next: boolean) => {
    setPreferences({
      channel_types: { ...channelTypes, [id]: next },
    });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {isLoading && !preferences ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.mutedText} />
        </View>
      ) : (
        channels.map(({ id, label, description }) => {
          const value = channelTypes[id];
          const enabled = typeof value === "boolean" ? value : true;
          return (
            <View key={id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowDescription}>{description}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={(v) => onToggle(id, v)}
                trackColor={{ true: colors.accent, false: colors.border }}
              />
            </View>
          );
        })
      )}

      <Pressable
        onPress={signOut}
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
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
  loading: {
    paddingVertical: spacing.xl,
    alignItems: "center",
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
  signOut: {
    marginTop: spacing.lg,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  signOutText: {
    color: colors.mutedText,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.7,
  },
});
