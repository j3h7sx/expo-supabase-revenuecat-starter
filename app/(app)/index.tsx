import { usePlacement } from "expo-superwall";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { supabase } from "@/src/data/supabase/client";
import { useAppAccess } from "@/src/presentation/contexts/app-access-context";
import { useAuth } from "@/src/providers/auth-provider";
import { placements } from "@/src/services/feature-gate-service";
import { colors, radius, spacing } from "@/src/theme";

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const { accessMode, canWrite } = useAppAccess();
  const [count, setCount] = useState(0);
  const { registerPlacement } = usePlacement();

  async function handleProtectedAction() {
    if (!canWrite) {
      await registerPlacement({
        placement: placements.lockedFeature,
        params: { source: "protected_action" },
      });
      return;
    }

    setCount((value) => value + 1);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Alert.alert("Could not sign out", error.message);
    }
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Starter app</Text>
          <Text style={styles.title}>Main app</Text>
          <Text style={styles.body}>
            This screen demonstrates access-mode based locking after onboarding.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.label}>Signed in as</Text>
          <Text style={styles.value}>{user?.email ?? profile?.id}</Text>
          <Text style={styles.label}>Access mode</Text>
          <Text style={styles.value}>{accessMode}</Text>
          <Text style={styles.label}>Protected write count</Text>
          <Text style={styles.value}>{count}</Text>
        </View>

        <View style={styles.actions}>
          <Button onPress={handleProtectedAction} title="Try protected action" />
          <Button onPress={signOut} title="Sign out" variant="secondary" />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
  },
  body: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 23,
  },
  container: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
  },
  header: {
    gap: spacing.sm,
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  label: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    marginTop: spacing.sm,
    textTransform: "uppercase",
  },
  panel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "800",
  },
  value: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
});
