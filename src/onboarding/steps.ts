import { env } from "@/src/config/env";
import type { OnboardingStep } from "@/src/onboarding/types";

export const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    type: "intro",
    title: "Build the first useful version",
    body: "This is a small onboarding scaffold your friend can redesign without touching routing.",
    cta: "Start",
  },
  {
    id: "goal",
    type: "single_choice",
    title: "What should this app help with?",
    body: "Single-choice steps are useful for positioning, personalization, or first-run setup.",
    options: [
      { label: "Track a habit", value: "habit" },
      { label: "Plan my day", value: "planning" },
      { label: "Learn something", value: "learning" },
    ],
  },
  {
    id: "preferences",
    type: "multi_choice",
    title: "Pick a few preferences",
    body: "Multi-choice steps save an array and can be synced to Supabase for later personalization.",
    options: [
      { label: "Simple reminders", value: "reminders" },
      { label: "Progress charts", value: "charts" },
      { label: "Weekly summaries", value: "summaries" },
    ],
  },
  {
    id: "paywall",
    type: "paywall",
    title: "Unlock the full version",
    body: "Superwall presents the paywall. RevenueCat handles the purchase and entitlement.",
    cta: "Continue",
    placement: env.superwallOnboardingPlacement,
  },
  {
    id: "complete",
    type: "complete",
    title: "You are ready",
    body: "The starter records onboarding completion in Supabase and routes into the app.",
    cta: "Enter app",
  },
];

export function getOnboardingStep(id: string | string[] | undefined) {
  const stepId = Array.isArray(id) ? id[0] : id;
  return onboardingSteps.find((step) => step.id === stepId) ?? onboardingSteps[0];
}

export function getNextOnboardingStepId(currentId: string) {
  const index = onboardingSteps.findIndex((step) => step.id === currentId);
  return onboardingSteps[index + 1]?.id ?? "complete";
}

export function getInitialOnboardingStepId() {
  return onboardingSteps[0].id;
}
