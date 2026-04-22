import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { config } from "../config";
import type { RootStackParamList, ScreenProps } from "../navigation";
import { colors, radius, spacing } from "../theme";

type Destination = {
  title: string;
  subtitle: string;
  route: keyof Pick<
    RootStackParamList,
    "MessageCompose" | "Preferences" | "TenantSwitcher"
  >;
};

const destinations: Destination[] = [
  {
    title: "Compose message",
    subtitle: "Trigger a workflow from the app",
    route: "MessageCompose",
  },
  {
    title: "Notification preferences",
    subtitle: "Per-channel opt-ins for this user",
    route: "Preferences",
  },
  {
    title: "Switch tenant",
    subtitle: "Scope feeds and preferences to a tenant",
    route: "TenantSwitcher",
  },
];

export default function MainScreen({ navigation }: ScreenProps<"Main">) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.label}>Signed in as</Text>
        <Text style={styles.userId}>{config.userId}</Text>
      </View>

      {destinations.map(({ title, subtitle, route }) => (
        <Pressable
          key={route}
          onPress={() => navigation.navigate(route)}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.rowTitle}>{title}</Text>
          <Text style={styles.rowSubtitle}>{subtitle}</Text>
        </Pressable>
      ))}

      <Pressable
        onPress={() => navigation.popToTop()}
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
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  userId: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  rowTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  rowSubtitle: {
    color: colors.mutedText,
    fontSize: 13,
  },
  pressed: {
    opacity: 0.7,
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
});
