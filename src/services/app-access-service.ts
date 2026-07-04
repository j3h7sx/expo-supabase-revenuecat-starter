import { paywallAccessMode, type PaywallAccessMode } from "@/src/config/feature-flags";
import type { Profile } from "@/src/services/profile-service";

export type AppAccessMode = "full" | "locked_read_only" | "paywall_blocked";

export function hasCompletedOnboarding(profile: Profile | null | undefined) {
  return Boolean(profile?.onboarding_completed);
}

export function hasActiveSubscription(profile: Profile | null | undefined) {
  return Boolean(profile?.has_active_entitlement);
}

export function resolveAppAccessMode(
  profile: Profile | null | undefined,
  mode: PaywallAccessMode = paywallAccessMode
): AppAccessMode {
  if (!hasCompletedOnboarding(profile) || hasActiveSubscription(profile)) {
    return "full";
  }

  if (
    profile?.subscription_status === "expired" ||
    profile?.subscription_status === "cancelled"
  ) {
    return "paywall_blocked";
  }

  return mode === "hard" ? "paywall_blocked" : "locked_read_only";
}
