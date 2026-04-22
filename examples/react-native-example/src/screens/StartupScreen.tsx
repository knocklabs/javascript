import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { ScreenProps } from "../navigation";
import { colors, spacing } from "../theme";

export default function StartupScreen({ navigation }: ScreenProps<"Startup">) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace("SignIn"), 600);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <Text style={styles.wordmark}>Knock</Text>
      <ActivityIndicator color={colors.mutedText} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: spacing.lg,
  },
  wordmark: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
});
