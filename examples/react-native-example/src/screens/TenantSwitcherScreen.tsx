import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "../auth";
import { KNOCK_TENANT_A, KNOCK_TENANT_B } from "../config";
import type { AuthedScreenProps } from "../navigation";
import { colors, radius, spacing } from "../theme";

const tenants: { id: string | null; name: string; hint: string }[] = [
  { id: null, name: "None", hint: "No tenant scoping" },
  { id: KNOCK_TENANT_A, name: "Tenant A", hint: KNOCK_TENANT_A },
  { id: KNOCK_TENANT_B, name: "Tenant B", hint: KNOCK_TENANT_B },
];

export default function TenantSwitcherScreen({
  navigation,
}: AuthedScreenProps<"TenantSwitcher">) {
  const { auth, setTenant } = useAuth();
  const active = auth?.tenant ?? null;

  const onSelect = (tenantId: string | null) => {
    setTenant(tenantId);
    navigation.goBack();
  };

  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={tenants}
      keyExtractor={(t) => t.id ?? "none"}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => {
        const isActive = item.id === active;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={({ pressed }) => [
              styles.row,
              isActive && styles.active,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.hint}>{item.hint}</Text>
            </View>
            {isActive ? <Text style={styles.check}>✓</Text> : null}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
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
  active: {
    borderColor: colors.accent,
  },
  rowText: {
    gap: spacing.xs,
  },
  separator: {
    height: spacing.sm,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  hint: {
    color: colors.mutedText,
    fontSize: 13,
    fontFamily: "Courier",
  },
  check: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
