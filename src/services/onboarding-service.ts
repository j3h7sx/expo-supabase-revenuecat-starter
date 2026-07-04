import { supabase } from "@/src/data/supabase/client";
import type { OnboardingAnswer } from "@/src/onboarding/types";
import { updateProfileOnboarding } from "@/src/services/profile-service";

export async function saveOnboardingAnswer(
  userId: string,
  stepId: string,
  answer: OnboardingAnswer
) {
  const { error } = await supabase.from("onboarding_responses").upsert(
    {
      answer,
      step_id: stepId,
      updated_at: new Date().toISOString(),
      user_id: userId,
    },
    { onConflict: "user_id,step_id" }
  );

  if (error) {
    throw error;
  }
}

export async function markOnboardingStep(userId: string, stepId: string) {
  await updateProfileOnboarding(userId, {
    current_onboarding_step: stepId,
    onboarding_completed: false,
  });
}

export async function completeOnboarding(userId: string) {
  await updateProfileOnboarding(userId, {
    current_onboarding_step: "complete",
    onboarding_completed: true,
  });
}
