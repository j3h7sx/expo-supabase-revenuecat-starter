import type { Profile } from "@/src/services/profile-service";

export function resolveInitialRoute(profile: Profile | null) {
  if (!profile) {
    return "/(auth)/sign-in" as const;
  }

  if (!profile.onboarding_completed) {
    return `/(onboarding)/${profile.current_onboarding_step ?? "welcome"}` as const;
  }

  return "/(app)" as const;
}
