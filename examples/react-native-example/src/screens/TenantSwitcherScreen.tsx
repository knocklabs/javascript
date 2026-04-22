import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import type { ScreenProps } from "../navigation";
import { colors, radius, spacing } from "../theme";

const tenants = [
  { id: "acme", name: "Acme Corp" },
  { id: "globex", name: "Globex" },
  { id: "hooli", name: "Hooli" },
];

export default function TenantSwitcherScreen({
  navigation,
}: ScreenProps<"TenantSwitcher">) {
  return (
    <FlatList
      style={styles.root}
      contentContainerStyle={styles.content}
      data={tenants}
      keyExtractor={(t) => t.id}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.id}>{item.id}</Text>
        </Pressable>
      )}
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
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
  id: {
    color: colors.mutedText,
    fontSize: 13,
    fontFamily: "Courier",
  },
  pressed: {
    opacity: 0.7,
  },
});
