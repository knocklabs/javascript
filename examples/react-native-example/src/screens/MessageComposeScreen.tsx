import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

import type { ScreenProps } from "../navigation";
import { colors, radius, spacing } from "../theme";

export default function MessageComposeScreen({
  navigation,
}: ScreenProps<"MessageCompose">) {
  const [workflowKey, setWorkflowKey] = useState("new-comment");
  const [body, setBody] = useState("");

  const canSend = workflowKey.trim().length > 0 && body.trim().length > 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Workflow key</Text>
      <TextInput
        value={workflowKey}
        onChangeText={setWorkflowKey}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={colors.mutedText}
        style={styles.input}
      />

      <Text style={styles.label}>Message</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        multiline
        placeholder="What do you want to notify about?"
        placeholderTextColor={colors.mutedText}
        style={[styles.input, styles.multiline]}
      />

      <Pressable
        onPress={() => navigation.goBack()}
        disabled={!canSend}
        style={({ pressed }) => [
          styles.button,
          !canSend && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.buttonText}>Send</Text>
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
  label: {
    color: colors.mutedText,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
