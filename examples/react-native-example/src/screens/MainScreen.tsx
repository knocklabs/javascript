import { NotificationFeed } from "@knocklabs/react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth";
import type { AuthedScreenProps, AuthedStackParamList } from "../navigation";
import { colors, radius, spacing } from "../theme";

type Destination = {
  title: string;
  route: keyof Pick<
    AuthedStackParamList,
    "MessageCompose" | "Preferences" | "TenantSwitcher"
  >;
};

const destinations: Destination[] = [
  { title: "Compose", route: "MessageCompose" },
  { title: "Preferences", route: "Preferences" },
  { title: "Tenant", route: "TenantSwitcher" },
];

export default function MainScreen({ navigation }: AuthedScreenProps<"Main">) {
  const { auth } = useAuth();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.userId}>{auth?.userId}</Text>
          {auth?.tenant ? (
            <Text style={styles.tenant}>tenant: {auth.tenant}</Text>
          ) : null}
        </View>
        <View style={styles.actions}>
          {destinations.map(({ title, route }) => (
            <Pressable
              key={route}
              onPress={() => navigation.navigate(route)}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.actionText}>{title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <NotificationFeed />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  identity: {
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userId: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
  },
  tenant: {
    color: colors.mutedText,
    fontSize: 13,
    fontFamily: "Courier",
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  pressed: {
    opacity: 0.7,
  },
});
