import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { usePlacement } from "expo-superwall";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import {
  getNextOnboardingStepId,
  getOnboardingStep,
} from "@/src/onboarding/steps";
import type { OnboardingAnswer } from "@/src/onboarding/types";
import { useAuth } from "@/src/providers/auth-provider";
import {
  completeOnboarding,
  markOnboardingStep,
  saveOnboardingAnswer,
} from "@/src/services/onboarding-service";
import { useOnboardingStore } from "@/src/stores/onboarding-store";
import { colors, radius, spacing } from "@/src/theme";

export default function OnboardingStepScreen() {
  const router = useRouter();
  const { step: routeStep } = useLocalSearchParams();
  const { profile, refreshProfile, user } = useAuth();
  const step = getOnboardingStep(routeStep);
  const storedAnswer = useOnboardingStore((state) => state.answers[step.id]);
  const setAnswer = useOnboardingStore((state) => state.setAnswer);
  const setCurrentStep = useOnboardingStore((state) => state.setCurrentStep);
  const resetOnboarding = useOnboardingStore((state) => state.reset);
  const [selected, setSelected] = useState<OnboardingAnswer>(storedAnswer ?? null);
  const [loading, setLoading] = useState(false);
  const nextStepId = useMemo(() => getNextOnboardingStepId(step.id), [step.id]);
  const { registerPlacement } = usePlacement({
    onDismiss: () => {
      void goToNextStep();
    },
    onSkip: () => {
      void goToNextStep();
    },
  });

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const userId = user.id;

  if (profile?.onboarding_completed) {
    return <Redirect href="/(app)" />;
  }

  function toggleOption(value: string) {
    if (step.type === "multi_choice") {
      const current = Array.isArray(selected) ? selected : [];
      setSelected(
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value]
      );
      return;
    }

    setSelected(value);
  }

  async function persistCurrentAnswer() {
    if (step.type === "intro" || step.type === "paywall" || step.type === "complete") {
      return;
    }

    setAnswer(step.id, selected);
    await saveOnboardingAnswer(userId, step.id, selected);
  }

  async function goToNextStep() {
    setLoading(true);
    try {
      await persistCurrentAnswer();

      if (step.type === "complete") {
        await completeOnboarding(userId);
        resetOnboarding();
        await refreshProfile();
        router.replace("/(app)");
        return;
      }

      await markOnboardingStep(userId, nextStepId);
      setCurrentStep(nextStepId);
      await refreshProfile();
      router.replace(`/(onboarding)/${nextStepId}`);
    } catch (error) {
      Alert.alert("Could not save progress", error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleContinue() {
    if (step.type === "paywall") {
      await registerPlacement({
        placement: step.placement,
        feature: () => {
          void goToNextStep();
        },
      });
      return;
    }

    await goToNextStep();
  }

  const isChoiceStep =
    step.type === "single_choice" || step.type === "multi_choice";
  const continueDisabled =
    loading ||
    (isChoiceStep &&
      (Array.isArray(selected) ? selected.length === 0 : selected === null));

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Onboarding</Text>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.body}>{step.body}</Text>
        </View>

        {isChoiceStep ? (
          <View style={styles.options}>
            {step.options.map((option) => {
              const active = Array.isArray(selected)
                ? selected.includes(option.value)
                : selected === option.value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleOption(option.value)}
                  style={[styles.option, active ? styles.optionActive : null]}
                >
                  <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <View style={styles.footer}>
          <Button
            disabled={continueDisabled}
            loading={loading}
            onPress={handleContinue}
            title={"cta" in step ? step.cta : "Continue"}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.mutedText,
    fontSize: 17,
    lineHeight: 25,
  },
  container: {
    flex: 1,
    gap: spacing.xl,
    justifyContent: "center",
  },
  footer: {
    gap: spacing.sm,
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
  option: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.md,
  },
  optionActive: {
    backgroundColor: "#E2F2EE",
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  optionTextActive: {
    color: colors.primary,
  },
  options: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
  },
});
